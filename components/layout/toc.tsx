// components/layout/table-of-contents.tsx
"use client"

import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { useMemo } from "react"

export type TOCItemType = {
  title: React.ReactNode
  url: string
  depth: number
}

// --------------------------------------------------------
// STRICT GEOMETRY ENGINE
// --------------------------------------------------------
const ITEM_HEIGHT = 32 // Strict 32px height per item
const INDENT_WIDTH = 16 // How far each nested level indents
const X_OFFSET = 8 // Initial padding from the left edge
const CORNER_RADIUS = 8 // The exact 'border-radius' of the line bends

export function TableOfContents({ items }: { items: TOCItemType[] }) {
  const headingIds = items.map((item) => item.url.substring(1))
  const activeId = useScrollSpy(headingIds)

  const minDepth = items.length > 0 ? Math.min(...items.map((i) => i.depth)) : 0

  // 1. Calculate Coordinates, Circuit Path, and Strict Path Lengths
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
            // Same depth: straight vertical line down
            d += `L ${pt.x} ${pt.y} `
            currentLength += Math.abs(pt.y - prev.y)
          } else {
            // Depth change: Circuit-board step with exact border-radius
            const midY = (prev.y + pt.y) / 2
            const dir = pt.x > prev.x ? 1 : -1
            const diffX = Math.abs(pt.x - prev.x)
            const diffY = Math.abs(pt.y - prev.y)

            // Ensure radius isn't larger than the available physical space
            const r = Math.min(CORNER_RADIUS, diffX / 2, diffY / 2)

            d += `L ${prev.x} ${midY - r} `
            d += `Q ${prev.x} ${midY}, ${prev.x + dir * r} ${midY} `
            d += `L ${pt.x - dir * r} ${midY} `
            d += `Q ${pt.x} ${midY}, ${pt.x} ${midY + r} `
            d += `L ${pt.x} ${pt.y} `

            // Calculate exact physical length of the bends and straight lines
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

  // 2. Identify Active bounds
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

  // 3. Calculate exact path percentages for Framer Motion
  const startLength = totalLength > 0 ? nodeLengths[parentIndex] : 0
  const endLength = totalLength > 0 ? nodeLengths[activeIndex] : 0

  // pathLength is the percentage of the line to draw
  const pathLengthRatio =
    totalLength > 0 ? (endLength - startLength) / totalLength : 0
  // pathOffset is the percentage of where the line should start
  const pathOffsetRatio = totalLength > 0 ? startLength / totalLength : 0

  if (!items || items.length === 0) return null

  return (
    <nav className="flex flex-col gap-6" aria-label="Table of Contents">
      <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
        On this page
      </span>

      <div className="relative">
        {/* 
          BASE LAYER: The structural, muted circuit track
        */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-muted-foreground/20"
          style={{ height: totalHeight }}
        >
          {/* Continuous rounded-step line */}
          <path
            d={pathD}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Base structural dots */}
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
          ACTIVE LAYER: The flowing wire & pulsating dots 
        */}
        <svg
          className="pointer-events-none absolute inset-y-0 left-0 w-20 text-primary"
          style={{ height: totalHeight }}
        >
          {/* 
            The Wire. 
            Because we animate pathLength and pathOffset, Framer Motion forces 
            the stroke to physically travel along the SVG bends. Zero diagonal flying.
          */}
          <motion.path
            d={pathD}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round" // Gives the wire soft, dot-like endings when moving
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: pathLengthRatio,
              pathOffset: pathOffsetRatio,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 35,
              mass: 0.8,
            }}
          />

          {/* 
            The Static Glow Dots.
            Instead of flying diagonally, the wire "delivers" the light. 
            When the wire reaches the node, the glowing dot fades in smoothly.
          */}
          {points.map((pt) => {
            const isActive = activeIndex === pt.index
            const isParentOfActive = parentIndex === pt.index

            if (!isActive && !isParentOfActive) return null

            return (
              <motion.circle
                key={`active-dot-${pt.url}`}
                cx={pt.x}
                cy={pt.y}
                r={3.5}
                fill="currentColor"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              />
            )
          })}
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
                      ? "font-medium text-primary"
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
