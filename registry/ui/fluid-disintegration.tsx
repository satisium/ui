"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface FluidDisintegrationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The URL of the image to disintegrate */
  imageUrl: string
  /** The content to reveal underneath the image */
  children: React.ReactNode
  /** Number of rows in the fluid grid. @default 12 */
  rows?: number
  /** Number of columns in the fluid grid. @default 12 */
  columns?: number
  /** Duration of the individual droplet animation. @default 0.8 */
  duration?: number
  /** Total time allocated for the stagger wave to traverse the grid. @default 0.6 */
  staggerAmount?: number
  /** Maximum randomized rotation applied to each droplet (in degrees). @default 45 */
  rotationRange?: number
  /** Maximum randomized translation applied to each droplet (in pixels). @default 25 */
  translationRange?: number
  /** GSAP easing string. @default "sine.inOut" */
  ease?: string
  className?: string
}

/**
 * FluidDisintegration
 *
 * An interactive liquid image transition component for Satis UI.
 * Fragments an image into an SVG grid mapped with a gooey color matrix.
 * On hover, the droplets calculate their proximity to the cursor and melt
 * outward, revealing the content underneath.
 */
export function FluidDisintegration({
  imageUrl,
  children,
  rows = 12,
  columns = 12,
  duration = 0.8,
  staggerAmount = 0.6,
  rotationRange = 45,
  translationRange = 25,
  ease = "sine.inOut",
  className,
  ...props
}: FluidDisintegrationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // Securely generate unique IDs to prevent SVG filter collisions
  const rawId = useId()
  const filterId = useMemo(
    () => `fluid-filter-${rawId.replace(/:/g, "")}`,
    [rawId]
  )
  const patternId = useMemo(
    () => `fluid-pattern-${rawId.replace(/:/g, "")}`,
    [rawId]
  )

  // Generate the math for the grid cells
  const gridCells = useMemo(() => {
    return Array.from({ length: rows * columns }).map((_, i) => {
      const r = Math.floor(i / columns)
      const c = i % columns
      return {
        id: i,
        x: (c / columns) * 100,
        y: (r / rows) * 100,
        width: 100 / columns,
        height: 100 / rows,
      }
    })
  }, [rows, columns])

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

      // 2. Calculate dynamic origin based on exact cursor entry point
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const cellWidthPx = rect.width / columns
      const cellHeightPx = rect.height / rows

      const col = Math.max(
        0,
        Math.min(columns - 1, Math.floor(x / cellWidthPx))
      )
      const row = Math.max(0, Math.min(rows - 1, Math.floor(y / cellHeightPx)))
      const startIndex = row * columns + col

      const pixels = gsap.utils.toArray(".fluid-drop", containerRef.current)

      if (tl.current) tl.current.kill()

      tl.current = gsap.timeline()

      tl.current.to(pixels, {
        // transformOrigin "50% 50%" inside GSAP perfectly targets the exact center
        // of each individual SVG rect's bounding box automatically!
        transformOrigin: "50% 50%",
        scale: 0,
        x: () => gsap.utils.random(-translationRange, translationRange),
        y: () => gsap.utils.random(-translationRange, translationRange),
        rotation: () => gsap.utils.random(-rotationRange, rotationRange),
        duration: duration,
        stagger: {
          amount: staggerAmount,
          grid: [rows, columns],
          from: startIndex,
        },
        ease: ease,
        force3D: true, // Hardware acceleration for heavy grid animations
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
        // Intentionally no viewBox. This allows percentage sizes to map perfectly to CSS pixels, preserving aspects.
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            // Pad the filter bounds to ensure the blur doesn't clip
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 25 -10
              "
              result="gooAlpha"
            />
            <feComposite in="SourceGraphic" in2="gooAlpha" operator="in" />
          </filter>

          {/* 
            The Holy Grail: 
            userSpaceOnUse maps this pattern directly to the SVG bounds. 
            No matter how many slices we make, they all render this exact map seamlessly.
          */}
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="100%"
            height="100%"
          >
            {/* Fallback solid color while image loads over network */}
            <rect
              width="100%"
              height="100%"
              className="fill-current text-muted"
            />
            <image
              href={imageUrl}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice" // Native object-cover!
            />
          </pattern>
        </defs>

        <g
          filter={`url(#${filterId})`}
          // Slightly scaled up group hides the gooey filter bleeding on the outer edges
          style={{ transform: "scale(1.02)", transformOrigin: "50% 50%" }}
        >
          {gridCells.map((cell) => (
            <rect
              key={cell.id}
              className="fluid-drop will-change-transform"
              x={`${cell.x}%`}
              y={`${cell.y}%`}
              style={{
                // THE FIX: We overlap the grid lines by exactly 1px to destroy subpixel gaps.
                // Because every rect is painted using the identical global pattern,
                // the overlapping pixels are completely identical to each other.
                width: `calc(${cell.width}% + 1px)`,
                height: `calc(${cell.height}% + 1px)`,
              }}
              fill={`url(#${patternId})`}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
