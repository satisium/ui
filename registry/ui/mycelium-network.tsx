"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface MyceliumNetworkProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The URL of the image to display on top */
  imageUrl: string
  /** The content to reveal underneath the image */
  children: React.ReactNode
  /** Number of columns in the network grid. @default 16 */
  columns?: number
  /** Number of rows in the network grid. @default 9 */
  rows?: number
  /** Initial thickness of the connecting web lines. @default "20%" */
  edgeThickness?: string
  /** Initial radius of the anchor nodes. @default "15%" */
  nodeRadius?: string
  /** Base duration of the snap and drift animations. @default 1.2 */
  duration?: number
  /** Controls how fast the wave ripples outward from the cursor. @default 0.7 */
  staggerMultiplier?: number
  className?: string
}

/**
 * MyceliumNetwork
 *
 * An interactive image transition component for Satisium UI.
 * Connects an SVG grid of nodes and edges masked with a mathematical gooey filter.
 * On hover, it calculates the cursor's origin and triggers a radiating physics
 * simulation where edges snap and nodes organically drift outward.
 */
export function MyceliumNetwork({
  imageUrl,
  children,
  columns = 16,
  rows = 9,
  edgeThickness = "20%",
  nodeRadius = "15%",
  duration = 1.2,
  staggerMultiplier = 0.7,
  className,
  ...props
}: MyceliumNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // Securely generate unique IDs to prevent SVG filter collisions
  const rawId = useId()
  const filterId = useMemo(
    () => `mycelium-filter-${rawId.replace(/:/g, "")}`,
    [rawId]
  )
  const maskId = useMemo(
    () => `mycelium-mask-${rawId.replace(/:/g, "")}`,
    [rawId]
  )

  // Mathematically generate the Neural/Fungal Network
  const { nodes, edges } = useMemo(() => {
    const nodesArr = []
    const edgesArr = []

    // Expand the grid from -10% to 110% to guarantee it bleeds off the
    // container perfectly, maintaining strict 90-degree CSS corners.
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const id = r * columns + c
        const rawCx = (c / (columns - 1)) * 120 - 10
        const rawCy = (r / (rows - 1)) * 120 - 10

        nodesArr.push({
          id: `node-${id}`,
          rawCx,
          rawCy,
          cx: `${rawCx}%`,
          cy: `${rawCy}%`,
        })
      }
    }

    // Connect the adjacent nodes to form the Mycelium web
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const idx = r * columns + c
        const n1 = nodesArr[idx]

        // Connect Right
        if (c < columns - 1) {
          const n2 = nodesArr[idx + 1]
          edgesArr.push({
            id: `edge-r-${idx}`,
            x1: n1.cx,
            y1: n1.cy,
            x2: n2.cx,
            y2: n2.cy,
            rawCx: (n1.rawCx + n2.rawCx) / 2,
            rawCy: (n1.rawCy + n2.rawCy) / 2,
          })
        }
        // Connect Down
        if (r < rows - 1) {
          const n3 = nodesArr[idx + columns]
          edgesArr.push({
            id: `edge-d-${idx}`,
            x1: n1.cx,
            y1: n1.cy,
            x2: n3.cx,
            y2: n3.cy,
            rawCx: (n1.rawCx + n3.rawCx) / 2,
            rawCy: (n1.rawCy + n3.rawCy) / 2,
          })
        }
        // Connect Diagonal (Creates the organic triangle web structure)
        if (c < columns - 1 && r < rows - 1) {
          const n4 = nodesArr[idx + columns + 1]
          edgesArr.push({
            id: `edge-diag-${idx}`,
            x1: n1.cx,
            y1: n1.cy,
            x2: n4.cx,
            y2: n4.cy,
            rawCx: (n1.rawCx + n4.rawCx) / 2,
            rawCy: (n1.rawCy + n4.rawCy) / 2,
          })
        }
      }
    }

    return { nodes: nodesArr, edges: edgesArr }
  }, [columns, rows])

  // contextSafe securely binds the GSAP timeline to the React component lifecycle,
  // preventing memory leaks and detached tweens on unmount.
  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleMouseEnter = contextSafe(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      // 1. If mid-animation, play forward seamlessly to preserve momentum
      if (
        tl.current &&
        tl.current.progress() > 0 &&
        tl.current.progress() < 1
      ) {
        tl.current.play()
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top
      const maxDist = Math.hypot(rect.width, rect.height)

      const domEdges = gsap.utils.toArray(
        ".mycelium-edge",
        containerRef.current
      )
      const domNodes = gsap.utils.toArray(
        ".mycelium-node",
        containerRef.current
      )

      if (tl.current) tl.current.kill()
      tl.current = gsap.timeline()

      // PHASE 1: The Snap
      // Animate the SVG attributes natively for 100% Safari stability.
      tl.current.to(
        domEdges,
        {
          attr: { "stroke-width": 0 }, // Thinning the line forces the Gooey filter to snap it
          duration: duration * 0.4,
          ease: "power2.in",
          // Dynamic radial ripple originating exactly from the cursor
          delay: (i, target) => {
            const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
            const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
            const dist = Math.hypot(cx - cursorX, cy - cursorY)
            return (dist / maxDist) * staggerMultiplier
          },
        },
        0
      )

      // PHASE 2: Spore Drift
      tl.current.to(
        domNodes,
        {
          attr: {
            r: 0,
            // Nodes physically drift UPWARD as they shrink
            cy: (i, target) =>
              `${parseFloat(target.dataset.cy) - gsap.utils.random(15, 30)}%`,
            cx: (i, target) =>
              `${parseFloat(target.dataset.cx) + gsap.utils.random(-15, 15)}%`,
          },
          duration: duration,
          ease: "power2.out",
          // Delay is slightly offset so the nodes drift ONLY after their connections snap
          delay: (i, target) => {
            const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
            const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
            const dist = Math.hypot(cx - cursorX, cy - cursorY)
            return (dist / maxDist) * staggerMultiplier + 0.15
          },
        },
        0
      )
    }
  )

  const handleMouseLeave = contextSafe(() => {
    if (tl.current) {
      tl.current.reverse()
    }
  })

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex-shrink-0 cursor-pointer overflow-hidden bg-background",
        className
      )}
      {...props}
    >
      {/* Underlying Content (The Reveal) */}
      <div className="absolute inset-0 z-0">{children}</div>

      {/* The Optics Engine: Hidden from screen readers to prevent layout noise */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            {/* Aggressive Alpha Contrast perfectly solidifies the web at rest */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 35 -15
              "
              result="gooAlpha"
            />
          </filter>

          <mask id={maskId}>
            <g filter={`url(#${filterId})`}>
              {edges.map((edge) => (
                <line
                  key={edge.id}
                  className="mycelium-edge will-change-transform"
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  data-cx={edge.rawCx}
                  data-cy={edge.rawCy}
                  stroke="white"
                  strokeWidth={edgeThickness} // Massively thick starting strokes ensures full coverage
                />
              ))}
              {nodes.map((node) => (
                <circle
                  key={node.id}
                  className="mycelium-node will-change-transform"
                  cx={node.cx}
                  cy={node.cy}
                  data-cx={node.rawCx}
                  data-cy={node.rawCy}
                  r={nodeRadius} // Massive nodes act as the heavy anchors for the spores
                  fill="white"
                />
              ))}
            </g>
          </mask>
        </defs>

        <g mask={`url(#${maskId})`}>
          {/* FOUC FIX: Instant solid structural block while image loads over network */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            className="fill-current text-muted"
          />
          <image
            x="0"
            y="0"
            width="100%"
            height="100%"
            href={imageUrl}
            preserveAspectRatio="xMidYMid slice" // Native object-cover!
          />
        </g>
      </svg>
    </div>
  )
}
