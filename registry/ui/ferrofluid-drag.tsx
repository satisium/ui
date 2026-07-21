"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface FerrofluidDragProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The URL of the image to display on top */
  imageUrl: string
  /** The content to reveal underneath the image */
  children: React.ReactNode
  /** Number of columns in the fluid grid. @default 12 */
  columns?: number
  /** Number of rows in the fluid grid. @default 12 */
  rows?: number
  /** Duration of the tear explosion for each bead. @default 1.2 */
  duration?: number
  /** Total time allocated for the stagger wave to traverse the grid. @default 0.4 */
  staggerAmount?: number
  /** GSAP easing string. @default "power2.out" */
  ease?: string
  className?: string
}

/**
 * FerrofluidDrag
 *
 * An interactive image transition component for Satis UI.
 * Applies a mathematical SVG Gooey filter to a grid of beads. On hover,
 * the beads calculate their proximity to the cursor and violently tear
 * outward like magnetic fluid, revealing the content underneath.
 */
export function FerrofluidDrag({
  imageUrl,
  children,
  columns = 12,
  rows = 12,
  duration = 1.2,
  staggerAmount = 0.4,
  ease = "power2.out",
  className,
  ...props
}: FerrofluidDragProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // Securely generate unique IDs to prevent SVG filter collisions across multiple components
  const rawId = useId()
  const filterId = useMemo(
    () => `tear-filter-${rawId.replace(/:/g, "")}`,
    [rawId]
  )
  const maskId = useMemo(() => `tear-mask-${rawId.replace(/:/g, "")}`, [rawId])

  // Memoize grid mapping to prevent expensive recalculations on every render
  const cells = useMemo(() => {
    return Array.from({ length: columns * rows }).map((_, i) => {
      const col = i % columns
      const row = Math.floor(i / columns)
      return {
        id: i,
        // Strictly mapped to 100% of the bounds. No bleeding.
        cx: `${(col / (columns - 1)) * 100}%`,
        cy: `${(row / (rows - 1)) * 100}%`,
        rawCx: (col / (columns - 1)) * 100,
        rawCy: (row / (rows - 1)) * 100,
      }
    })
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

      // Calculate exact cell the cursor entered to originate the tear
      const col = Math.max(
        0,
        Math.min(
          columns - 1,
          Math.round((cursorX / rect.width) * (columns - 1))
        )
      )
      const row = Math.max(
        0,
        Math.min(rows - 1, Math.round((cursorY / rect.height) * (rows - 1)))
      )
      const startIndex = row * columns + col

      const circles = gsap.utils.toArray(".tear-bead", containerRef.current)

      if (tl.current) tl.current.kill()

      tl.current = gsap.timeline()

      // Direct outward tear away from the cursor
      tl.current.to(circles, {
        x: (i, target) => {
          const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
          const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
          const dx = cx - cursorX
          const dy = cy - cursorY
          const angle = Math.atan2(dy, dx)
          const dist = Math.hypot(dx, dy) || 1

          // Cells closest to the cursor get pushed the hardest (up to 350px)
          const pushForce =
            Math.max(100, 350 - dist) + gsap.utils.random(0, 100)
          return Math.cos(angle) * pushForce
        },
        y: (i, target) => {
          const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
          const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
          const dx = cx - cursorX
          const dy = cy - cursorY
          const angle = Math.atan2(dy, dx)
          const dist = Math.hypot(dx, dy) || 1

          const pushForce =
            Math.max(100, 350 - dist) + gsap.utils.random(0, 100)
          return Math.sin(angle) * pushForce
        },
        scale: 0,
        duration: duration,
        ease: ease,
        force3D: true, // Hardware acceleration for heavy grid animations
        stagger: {
          amount: staggerAmount,
          grid: [rows, columns],
          from: startIndex, // Ripple outward precisely from the mouse coordinates
        },
      })
    }
  )

  const handleMouseLeave = contextSafe(() => {
    // Reverses exactly from the current playhead position
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
        "relative shrink-0 cursor-pointer overflow-hidden bg-background",
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
                0 0 0 40 -18
              "
              result="gooAlpha"
            />
          </filter>

          <mask id={maskId}>
            {/* The filter fuses the separate circles together into a single gooey sheet */}
            <g filter={`url(#${filterId})`}>
              {cells.map((cell) => (
                <circle
                  key={cell.id}
                  className="tear-bead will-change-transform"
                  cx={cell.cx}
                  cy={cell.cy}
                  data-cx={cell.rawCx}
                  data-cy={cell.rawCy}
                  r="25%"
                  fill="white"
                />
              ))}
            </g>
          </mask>
        </defs>

        {/* The rendered image, with the gooey mask mathematically applied */}
        <g mask={`url(#${maskId})`}>
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
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
    </div>
  )
}
