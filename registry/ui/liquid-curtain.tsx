"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface LiquidCurtainProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The URL of the image to display on top */
  imageUrl: string
  /** The content to reveal underneath the image */
  children: React.ReactNode
  /** Number of vertical strips/columns. Higher = stringier liquid. @default 18 */
  columns?: number
  /** Duration of the drip animation for each individual strip. @default 1.2 */
  duration?: number
  /** Total time allocated for the stagger wave to traverse the columns. @default 0.6 */
  staggerAmount?: number
  /** GSAP easing string. @default "power2.inOut" */
  ease?: string
  className?: string
}

/**
 * LiquidCurtain
 *
 * An interactive image transition component for Satisium UI.
 * Applies a heavily asymmetrical SVG Gooey filter to a grid of vertical strips.
 * On hover, the strips calculate their proximity to the cursor and drip downward
 * like thick paint or liquid, revealing the content underneath.
 */
export function LiquidCurtain({
  imageUrl,
  children,
  columns = 18,
  duration = 1.2,
  staggerAmount = 0.6,
  ease = "power2.inOut",
  className,
  ...props
}: LiquidCurtainProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // Securely generate unique IDs to prevent SVG filter collisions across multiple components
  const rawId = useId()
  const filterId = useMemo(() => `liquid-${rawId.replace(/:/g, "")}`, [rawId])
  const patternId = useMemo(
    () => `liquid-pat-${rawId.replace(/:/g, "")}`,
    [rawId]
  )

  // Memoize column mapping to prevent expensive recalculations on every render
  const strips = useMemo(() => {
    return Array.from({ length: columns }).map((_, i) => ({
      id: i,
      x: (i / columns) * 100,
      width: 100 / columns,
    }))
  }, [columns])

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
      const colWidthPx = rect.width / columns

      const col = Math.max(0, Math.min(columns - 1, Math.floor(x / colWidthPx)))

      const stripElements = gsap.utils.toArray(
        ".liquid-strip",
        containerRef.current
      )

      if (tl.current) tl.current.kill()

      tl.current = gsap.timeline()

      tl.current.to(stripElements, {
        yPercent: () => gsap.utils.random(110, 150), // Randomize the drip depth
        scaleY: () => gsap.utils.random(0.1, 0.4), // Contract the droplet as it falls
        // 50% 100% maps perfectly to "bottom center" inside SVGs
        transformOrigin: "50% 100%",
        duration: duration,
        stagger: {
          amount: staggerAmount,
          from: col, // Radiate outward from the user's exact cursor position
        },
        ease: ease,
        force3D: true, // Hardware acceleration for heavy SVG path manipulations
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
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            // Pad bounds heavily so the falling liquid doesn't clip at the bottom
            x="-20%"
            y="-20%"
            width="140%"
            height="160%"
          >
            {/* The strong vertical blur creates the stringy liquid curtain effect */}
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="6 15"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 30 -12
              "
              result="gooAlpha"
            />
            <feComposite in="SourceGraphic" in2="gooAlpha" operator="in" />
          </filter>

          {/* 
            userSpaceOnUse maps this pattern directly to the SVG bounds. 
            No matter how many slices we make, they all render this exact map seamlessly.
          */}
          <pattern
            id={patternId}
            patternUnits="userSpaceOnUse"
            width="100%"
            height="100%"
          >
            <rect
              width="100%"
              height="100%"
              className="fill-current text-muted"
            />
            <image
              href={imageUrl}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>

        <g
          filter={`url(#${filterId})`}
          // Slightly scaled up group hides the gooey filter bleeding on the outer edges
          style={{ transform: "scale(1.02)", transformOrigin: "50% 50%" }}
        >
          {strips.map((strip) => (
            <rect
              key={strip.id}
              className="liquid-strip will-change-transform"
              x={`${strip.x}%`}
              y="0"
              style={{
                // Overlapping strips by exactly 1px to eradicate grid seams natively
                width: `calc(${strip.width}% + 1px)`,
                height: "100%",
              }}
              fill={`url(#${patternId})`}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
