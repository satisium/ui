export const emberBurnDemoString = `
import { EmberBurn } from "@/components/ui/ember-burn"

export default function EmberBurnDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased">
      <EmberBurn
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/0.jpg"
        duration={2.5}
        ease="power2.inOut"
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </EmberBurn>
    </main>
  )
}
`

export const emberBurnString = `"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface EmberBurnProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  children: React.ReactNode
  duration?: number
  maxDisplacement?: number
  ease?: string
  className?: string
}

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
  const proxyRef = useRef({ r: 0, dispScale: 0 })

  const rawId = useId()
  const maskFilterId = useMemo(() => \`ember-mask-filter-\${rawId.replace(/:/g, "")}\`, [rawId])
  const maskId = useMemo(() => \`ember-mask-\${rawId.replace(/:/g, "")}\`, [rawId])
  const blurId = useMemo(() => \`ember-blur-\${rawId.replace(/:/g, "")}\`, [rawId])
  const glowId = useMemo(() => \`ember-glow-\${rawId.replace(/:/g, "")}\`, [rawId])

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    if (tl.current && tl.current.progress() > 0 && tl.current.progress() < 1) {
      tl.current.play()
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const width = rect.width
    const height = rect.height

    const maxRadius = Math.hypot(width, height) + 150

    const hole = containerRef.current.querySelector(".ember-hole")
    const disp = containerRef.current.querySelector(".ember-displacement")

    if (!hole || !disp) return

    gsap.set(hole, { attr: { cx: x, cy: y } })

    if (tl.current) tl.current.kill()

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
  })

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
      <div className="absolute inset-0 z-0">{children}</div>

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
            <g filter={\`url(#\${maskFilterId})\`}>
              <rect
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
                fill="white"
              />
              <circle
                className="ember-hole"
                cx="0"
                cy="0"
                r="0"
                fill="black"
                filter={\`url(#\${blurId})\`}
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

            <feGaussianBlur
              in="emberCore"
              stdDeviation="8"
              result="emberBloom"
            />

            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="emberBloom" />
              <feMergeNode in="emberCore" />
            </feMerge>
          </filter>
        </defs>

        <g filter={\`url(#\${glowId})\`}>
          <g mask={\`url(#\${maskId})\`}>
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
`

export const emberBurnFile = {
  "ember-burn.tsx": {
    code: emberBurnString,
    language: "tsx",
  },
}
