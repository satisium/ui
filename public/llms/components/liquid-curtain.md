# Liquid Curtain Component Context

**Description:** An interactive image transition component for Satis UI. Applies a heavily asymmetrical SVG Gooey filter to a grid of vertical strips. On hover, the strips calculate their proximity to the cursor and drip downward like thick paint or liquid, revealing the content underneath. Utilizes GSAP `contextSafe` for strict memory management and ARIA presentation standards for screen readers.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add liquid-curtain
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type        | Default          | Description                      |
| :-------------- | :---------- | :--------------- | :------------------------------- |
| `imageUrl`      | `string`    | _Required_       | The top image URL.               |
| `children`      | `ReactNode` | _Required_       | Reveal content.                  |
| `columns`       | `number`    | `18`             | Vertical strips count.           |
| `duration`      | `number`    | `1.2`            | Drip animation duration.         |
| `staggerAmount` | `number`    | `0.6`            | Wave completion time allocation. |
| `ease`          | `string`    | `"power2.inOut"` | Easing curve.                    |

## 3. Core Component Source

**File Path:** `components/ui/liquid-curtain.tsx`

```tsx
"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface LiquidCurtainProps
  extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  children: React.ReactNode
  columns?: number
  duration?: number
  staggerAmount?: number
  ease?: string
  className?: string
}

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

  const rawId = useId()
  const filterId = useMemo(() => `liquid-${rawId.replace(/:/g, "")}`, [rawId])
  const patternId = useMemo(() => `liquid-pat-${rawId.replace(/:/g, "")}`, [rawId])

  const strips = useMemo(() => {
    return Array.from({ length: columns }).map((_, i) => ({
      id: i,
      x: (i / columns) * 100,
      width: 100 / columns,
    }))
  }, [columns])

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    if (tl.current && tl.current.progress() > 0 && tl.current.progress() < 1) {
      tl.current.play()
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const colWidthPx = rect.width / columns

    const col = Math.max(0, Math.min(columns - 1, Math.floor(x / colWidthPx)))

    const stripElements = gsap.utils.toArray(".liquid-strip", containerRef.current)

    if (tl.current) tl.current.kill()

    tl.current = gsap.timeline()

    tl.current.to(stripElements, {
      yPercent: () => gsap.utils.random(110, 150),
      scaleY: () => gsap.utils.random(0.1, 0.4),
      transformOrigin: "50% 100%",
      duration: duration,
      stagger: {
        amount: staggerAmount,
        from: col,
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
            height="160%"
          >
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
          style={{ transform: "scale(1.02)", transformOrigin: "50% 50%" }}
        >
          {strips.map((strip) => (
            <rect
              key={strip.id}
              className="liquid-strip will-change-transform"
              x={`${strip.x}%`}
              y="0"
              style={{
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
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { LiquidCurtain } from "@/components/ui/liquid-curtain"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <LiquidCurtain
        imageUrl="/placeholder.jpg"
        columns={24}
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2>Tada!</h2>
        </div>
      </LiquidCurtain>
    </main>
  )
}
```
