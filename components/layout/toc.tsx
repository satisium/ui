// components/layout/toc.tsx
"use client"

import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type TOCItemType = {
  title: React.ReactNode
  url: string
  depth: number
}

// --------------------------------------------------------
// STRICT GEOMETRY & TIMING ENGINE
// --------------------------------------------------------
const ITEM_HEIGHT = 32
const INDENT_WIDTH = 16
const X_OFFSET = 8
const CORNER_RADIUS = 8

// 👇 TIMING CONSTANTS (IN SECONDS) 👇
const ACTIVE_DURATION = 0.6 // How fast the active line snaps to the new section
const HOVER_DURATION = 0.3 // How fast the magnetic hover dot follows the mouse
const LIQUID_STRETCH_DELAY = 0.9 // How far behind the "tail" drags to create elasticity

export function TableOfContents({ items }: { items: TOCItemType[] }) {
  const headingIds = items.map((item) => item.url.substring(1))
  const { activeId, setClickId } = useScrollSpy(headingIds)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const minDepth = items.length > 0 ? Math.min(...items.map((i) => i.depth)) : 0

  // 1. Calculate Coordinates and Path Lengths
  const { points, pathD, nodeLengths, totalLength, totalHeight } =
    useMemo(() => {
      if (!items || items.length === 0) {
        return {
          points: [],
          pathD: "",
          nodeLengths: [],
          totalLength: 0,
          totalHeight: 0,
        }
      }

      const pts = items.map((item, index) => {
        const normalizedDepth = item.depth - minDepth
        const x = normalizedDepth * INDENT_WIDTH + X_OFFSET
        const y = index * ITEM_HEIGHT + ITEM_HEIGHT / 2
        return { ...item, index, x, y, isParent: normalizedDepth === 0 }
      })

      let d = ""
      let currentLength = 0
      const lengths: number[] = []

      pts.forEach((pt, i) => {
        if (i === 0) {
          d += `M ${pt.x} ${pt.y} `
          lengths.push(0)
        } else {
          const prev = pts[i - 1]

          if (pt.x === prev.x) {
            d += `L ${pt.x} ${pt.y} `
            currentLength += Math.abs(pt.y - prev.y)
          } else {
            const midY = (prev.y + pt.y) / 2
            const dir = pt.x > prev.x ? 1 : -1
            const diffX = Math.abs(pt.x - prev.x)
            const diffY = Math.abs(pt.y - prev.y)
            const r = Math.min(CORNER_RADIUS, diffX / 2, diffY / 2)

            d += `L ${prev.x} ${midY - r} `
            d += `Q ${prev.x} ${midY}, ${prev.x + dir * r} ${midY} `
            d += `L ${pt.x - dir * r} ${midY} `
            d += `Q ${pt.x} ${midY}, ${pt.x} ${midY + r} `
            d += `L ${pt.x} ${pt.y} `

            const straightY = diffY / 2 - r
            const straightX = diffX - 2 * r
            const arcLength = (Math.PI * r) / 2

            currentLength += straightY * 2 + straightX + arcLength * 2
          }
          lengths.push(currentLength)
        }
      })

      return {
        points: pts,
        pathD: d,
        nodeLengths: lengths,
        totalLength: currentLength,
        totalHeight: items.length * ITEM_HEIGHT,
      }
    }, [items, minDepth])

  // 2. Identify the Nodes
  const activeIndex = Math.max(
    0,
    points.findIndex((p) => p.url.substring(1) === activeId)
  )

  let parentIndex = 0
  for (let i = activeIndex; i >= 0; i--) {
    if (points[i] && points[i].isParent) {
      parentIndex = i
      break
    }
  }

  // 3. Liquid Elasticity Physics Engine (Upgraded to Duration Control)
  const targetStartRatio =
    totalLength > 0 ? nodeLengths[parentIndex] / totalLength : 0
  const targetEndRatio =
    totalLength > 0 ? nodeLengths[activeIndex] / totalLength : 0

  const motionStart = useMotionValue(targetStartRatio)
  const motionEnd = useMotionValue(targetEndRatio)

  useEffect(() => {
    // The Head (Active Dot) moves exactly at the defined duration
    const animEnd = animate(motionEnd, targetEndRatio, {
      type: "spring",
      bounce: 0, // 0 bounce + spring type = perfectly smooth easing
      duration: ACTIVE_DURATION,
    })

    // The Tail (Parent Dot) drags slightly behind, creating the stretch
    const animStart = animate(motionStart, targetStartRatio, {
      type: "spring",
      bounce: 0,
      duration: ACTIVE_DURATION + LIQUID_STRETCH_DELAY,
    })

    // Cleanup animations if component unmounts or user scrolls insanely fast
    return () => {
      animEnd.stop()
      animStart.stop()
    }
  }, [targetStartRatio, targetEndRatio, motionStart, motionEnd])

  const wireOffsetRatio = useTransform(() =>
    Math.min(motionStart.get(), motionEnd.get())
  )
  const wireLengthRatio = useTransform(() =>
    Math.max(Math.abs(motionEnd.get() - motionStart.get()), 0)
  )

  const safeLength = Math.max(totalLength, 1)

  const wireDashArray = useTransform(
    wireLengthRatio,
    (l) => `${l * safeLength} ${safeLength * 2}`
  )
  const wireDashOffset = useTransform(
    wireOffsetRatio,
    (o) => `-${o * safeLength}`
  )

  const dotDashArray = `0.01 ${safeLength * 2}`
  const tailDashOffset = useTransform(motionStart, (o) => `-${o * safeLength}`)
  const headDashOffset = useTransform(motionEnd, (o) => `-${o * safeLength}`)

  if (!items || items.length === 0) return null

  return (
    <nav
      className="pb-20[mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)] flex flex-col gap-6"
      aria-label="Table of Contents"
    >
      <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
        On this page
      </span>

      <div className="relative">
        {/* BASE LAYER: Structural Track */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-muted-foreground/20"
          style={{ height: totalHeight }}
        >
          <path
            d={pathD}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points
            .filter((p) => p.isParent)
            .map((pt, i) => (
              <circle
                key={`base-dot-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill="currentColor"
              />
            ))}
        </svg>

        {/* MAGNETIC HOVER LAYER */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-primary"
          style={{ height: totalHeight }}
        >
          <motion.circle
            initial={false}
            animate={{
              cx:
                hoveredIndex !== null
                  ? points[hoveredIndex]?.x
                  : points[activeIndex]?.x || X_OFFSET,
              cy:
                hoveredIndex !== null
                  ? points[hoveredIndex]?.y
                  : points[activeIndex]?.y || ITEM_HEIGHT / 2,
              opacity:
                hoveredIndex !== null && hoveredIndex !== activeIndex ? 0.3 : 0,
            }}
            r={3.5}
            fill="currentColor"
            transition={{
              type: "spring",
              bounce: 0,
              duration: HOVER_DURATION, // Uses the new global duration constant
            }}
          />
        </svg>

        {/* KINETIC LIQUID LAYER */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-primary"
          style={{ height: totalHeight }}
        >
          <motion.path
            d={pathD}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: wireDashArray,
              strokeDashoffset: wireDashOffset,
            }}
          />
          <motion.path
            d={pathD}
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: dotDashArray,
              strokeDashoffset: tailDashOffset,
            }}
          />
          <motion.path
            d={pathD}
            stroke="currentColor"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: dotDashArray,
              strokeDashoffset: headDashOffset,
            }}
          />
        </svg>

        {/* TEXT LAYER */}
        <div className="relative flex w-full flex-col">
          <TooltipProvider delayDuration={400}>
            {points.map((pt) => {
              const isActive = activeIndex === pt.index

              return (
                <Tooltip key={pt.url}>
                  <TooltipTrigger asChild>
                    <Link
                      href={pt.url}
                      onClick={() => setClickId(pt.url.substring(1))}
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="group relative flex h-8 w-full items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                      style={{ paddingLeft: pt.x + 16 }}
                    >
                      <span
                        className={`truncate text-[13px] transition-colors duration-300 ${
                          isActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {pt.title}
                      </span>
                    </Link>
                  </TooltipTrigger>

                  <TooltipContent side="left" className="font-medium">
                    {pt.title}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>
      </div>
    </nav>
  )
}
