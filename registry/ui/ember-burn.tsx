"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface EmberBurnProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The URL of the image to burn away */
  imageUrl: string
  /** The content to reveal underneath the image */
  children: React.ReactNode
  /** Duration of the burn animation. @default 2.5 */
  duration?: number
  /** The maximum displacement scale of the turbulence. Higher = more jagged edges. @default 400 */
  maxDisplacement?: number
  /** GSAP easing string. @default "power2.inOut" */
  ease?: string
  className?: string
}

/**
 * EmberBurn
 *
 * An interactive image transition component for Satisium UI.
 * Simulates a burning ember hole using complex SVG displacement maps and
 * color matrices. The burn originates exactly from the mouse entry coordinates.
 */
export function EmberBurn({
  imageUrl,
  children,
  duration = 2.5,
  maxDisplacement = 400,
  ease = "power2.inOut",
  className,
  ...props
}: EmberBurnProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // A proxy object to animate SVG attributes smoothly via GSAP
  const proxyRef = useRef({ r: 0, dispScale: 0 })

  // Securely generate unique IDs to prevent SVG filter collisions across multiple components
  const rawId = useId()
  const maskFilterId = useMemo(
    () => `ember-mask-filter-${rawId.replace(/:/g, "")}`,
    [rawId]
  )
  const maskId = useMemo(() => `ember-mask-${rawId.replace(/:/g, "")}`, [rawId])
  const blurId = useMemo(() => `ember-blur-${rawId.replace(/:/g, "")}`, [rawId])
  const glowId = useMemo(() => `ember-glow-${rawId.replace(/:/g, "")}`, [rawId])

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
      const width = rect.width
      const height = rect.height

      // Calculate maximum radius required to cover the entire container from the entry point
      const maxRadius = Math.hypot(width, height) + 150

      const hole = containerRef.current.querySelector(".ember-hole")
      const disp = containerRef.current.querySelector(".ember-displacement")

      if (!hole || !disp) return

      // Instantly move the hidden hole to the cursor's coordinates
      gsap.set(hole, { attr: { cx: x, cy: y } })

      if (tl.current) tl.current.kill()

      // Reset proxy values
      proxyRef.current.r = 0
      proxyRef.current.dispScale = 0

      tl.current = gsap.timeline()
      tl.current.to(proxyRef.current, {
        r: maxRadius,
        dispScale: maxDisplacement,
        duration: duration,
        ease: ease,
        onUpdate: () => {
          hole.setAttribute("r", proxyRef.current.r.toString())
          disp.setAttribute("scale", proxyRef.current.dispScale.toString())
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
            id={maskFilterId}
            colorInterpolationFilters="sRGB"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              className="ember-displacement"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="25" />
          </filter>

          <mask id={maskId}>
            <g filter={`url(#${maskFilterId})`}>
              {/* White allows the image to be fully visible */}
              <rect
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
                fill="white"
              />
              {/* Black burns the hole into the mask, revealing the div underneath */}
              <circle
                className="ember-hole"
                cx="0"
                cy="0"
                r="0"
                fill="black"
                filter={`url(#${blurId})`}
              />
            </g>
          </mask>

          <filter
            id={glowId}
            colorInterpolationFilters="sRGB"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            {/* 1. Extract the translucent, burning edge */}
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation="4"
              result="blurAlpha"
            />
            <feComposite
              in="SourceAlpha"
              in2="blurAlpha"
              operator="out"
              result="edgeAlpha"
            />

            {/* 2. Colorize the edge to create the glowing hot ember (Orange/Red) */}
            <feColorMatrix
              in="edgeAlpha"
              type="matrix"
              values="
                0 0 0 0 1     
                0 0 0 0 0.4  
                0 0 0 0 0     
                0 0 0 25 -5.5   
              "
              result="emberCore"
            />

            {/* 3. Soften the core to create the bloom/glow effect */}
            <feGaussianBlur
              in="emberCore"
              stdDeviation="8"
              result="emberBloom"
            />

            {/* 4. Layer everything together perfectly */}
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="emberBloom" />
              <feMergeNode in="emberCore" />
            </feMerge>
          </filter>
        </defs>

        {/* The rendered image, with the glow and mask mathematically applied */}
        <g filter={`url(#${glowId})`}>
          <g mask={`url(#${maskId})`}>
            <rect
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
              className="fill-current text-muted"
            />
            <image
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
              href={imageUrl}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </g>
      </svg>
    </div>
  )
}
