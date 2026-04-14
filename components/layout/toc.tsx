// components/layout/table-of-contents.tsx
"use client"

import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import Link from "next/link"
import { useEffect, useMemo } from "react"

export type TOCItemType = {
  title: React.ReactNode
  url: string
  depth: number
}

// --------------------------------------------------------
// STRICT GEOMETRY ENGINE
// --------------------------------------------------------
const ITEM_HEIGHT = 32
const INDENT_WIDTH = 16
const X_OFFSET = 8
const CORNER_RADIUS = 8

export function TableOfContents({ items }: { items: TOCItemType[] }) {
  const headingIds = items.map((item) => item.url.substring(1))
  const activeId = useScrollSpy(headingIds)

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

  // 3. Liquid Elasticity Physics Engine
  const targetStartRatio =
    totalLength > 0 ? nodeLengths[parentIndex] / totalLength : 0
  const targetEndRatio =
    totalLength > 0 ? nodeLengths[activeIndex] / totalLength : 0

  const motionStart = useMotionValue(targetStartRatio)
  const motionEnd = useMotionValue(targetEndRatio)

  // Asymmetric Springs: Head moves faster, Tail drags slightly slower creating a stretch
  const springStart = useSpring(motionStart, { stiffness: 250, damping: 30 })
  const springEnd = useSpring(motionEnd, { stiffness: 350, damping: 35 })

  useEffect(() => {
    motionStart.set(targetStartRatio)
    motionEnd.set(targetEndRatio)
  }, [targetStartRatio, targetEndRatio, motionStart, motionEnd])

  // Derive Native SVG Dashes instead of relying on Framer Motion's prop intercepts
  const wireOffsetRatio = useTransform(() =>
    Math.min(springStart.get(), springEnd.get())
  )
  const wireLengthRatio = useTransform(() =>
    Math.max(Math.abs(springEnd.get() - springStart.get()), 0)
  )

  // Map the ratios strictly to physical pixels based on total path length
  const safeLength = Math.max(totalLength, 1) // Prevent division/rendering errors on initial load

  // The line bridging the two dots
  const wireDashArray = useTransform(
    wireLengthRatio,
    (l) => `${l * safeLength} ${safeLength}`
  )
  const wireDashOffset = useTransform(
    wireOffsetRatio,
    (o) => `-${o * safeLength}`
  )

  // The perfect traveling dots (0.01px dash length + strokeLinecap="round" = geometric circle)
  const dotDashArray = `0.01 ${safeLength}`
  const tailDashOffset = useTransform(springStart, (o) => `-${o * safeLength}`)
  const headDashOffset = useTransform(springEnd, (o) => `-${o * safeLength}`)

  if (!items || items.length === 0) return null

  return (
    <nav className="flex flex-col gap-6" aria-label="Table of Contents">
      <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
        On this page
      </span>

      <div className="relative">
        {/* 
          BASE LAYER: Structural Track
        */}
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
                r={2.5}
                fill="currentColor"
              />
            ))}
        </svg>

        {/* 
          KINETIC LIQUID LAYER
        */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-primary"
          style={{ height: totalHeight }}
        >
          {/* THE STRETCHING WIRE */}
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

          {/* THE TRAVELING TAIL DOT (Anchor) */}
          <motion.path
            d={pathD}
            stroke="currentColor"
            strokeWidth="5" // Thickness creates the 5px dot radius
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: dotDashArray,
              strokeDashoffset: tailDashOffset,
            }}
          />

          {/* THE TRAVELING HEAD DOT (Active) */}
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

        {/* 
          TEXT LAYER
        */}
        <div className="relative flex w-full flex-col">
          {points.map((pt) => {
            const isActive = activeIndex === pt.index

            return (
              <Link
                key={pt.url}
                href={pt.url}
                className="group relative flex h-8 w-full items-center outline-none"
                style={{ paddingLeft: pt.x + 16 }}
              >
                <span
                  className={`truncate text-[13px] transition-colors duration-300 ${
                    isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pt.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
