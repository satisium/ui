export const fluidDisintegrationDemoString = `
import { FluidDisintegration } from "@/components/satisium-ui/fluid-disintegration"

export default function FluidDisintegrationDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased">
      <FluidDisintegration
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/0.jpg"
        rows={10}
        columns={16}
        duration={0.8}
        staggerAmount={0.6}
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </FluidDisintegration>
    </main>
  )
}
`

export const fluidDisintegrationString = `"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface FluidDisintegrationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  children: React.ReactNode
  rows?: number
  columns?: number
  duration?: number
  staggerAmount?: number
  rotationRange?: number
  translationRange?: number
  ease?: string
  className?: string
}

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

  const rawId = useId()
  const filterId = useMemo(() => \`fluid-filter-\${rawId.replace(/:/g, "")}\`, [rawId])
  const patternId = useMemo(() => \`fluid-pattern-\${rawId.replace(/:/g, "")}\`, [rawId])

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

    const cellWidthPx = rect.width / columns
    const cellHeightPx = rect.height / rows

    const col = Math.max(0, Math.min(columns - 1, Math.floor(x / cellWidthPx)))
    const row = Math.max(0, Math.min(rows - 1, Math.floor(y / cellHeightPx)))
    const startIndex = row * columns + col

    const pixels = gsap.utils.toArray(".fluid-drop", containerRef.current)

    if (tl.current) tl.current.kill()

    tl.current = gsap.timeline()

    tl.current.to(pixels, {
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
      force3D: true,
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
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
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
          filter={\`url(#\${filterId})\`}
          style={{ transform: "scale(1.02)", transformOrigin: "50% 50%" }}
        >
          {gridCells.map((cell) => (
            <rect
              key={cell.id}
              className="fluid-drop will-change-transform"
              x={\`\${cell.x}%\`}
              y={\`\${cell.y}%\`}
              style={{
                width: \`calc(\${cell.width}% + 1px)\`,
                height: \`calc(\${cell.height}% + 1px)\`,
              }}
              fill={\`url(#\${patternId})\`}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
`

export const fluidDisintegrationFile = {
  "fluid-disintegration.tsx": {
    code: fluidDisintegrationString,
    language: "tsx",
  },
}
