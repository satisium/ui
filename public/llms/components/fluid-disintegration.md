# Fluid Disintegration Component Context

**Description:** An interactive liquid image transition component for Satis UI. Fragments an image into an SVG grid mapped with a gooey color matrix. On hover, the droplets calculate their proximity to the cursor and melt outward, revealing the content underneath. Utilizes GSAP `contextSafe` for strict memory management and ARIA presentation standards for screen readers.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/fluid-disintegration.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop               | Type        | Default        | Description                      |
| :----------------- | :---------- | :------------- | :------------------------------- |
| `imageUrl`         | `string`    | _Required_     | The image URL.                   |
| `children`         | `ReactNode` | _Required_     | Reveal content.                  |
| `rows`             | `number`    | `12`           | Grid row count.                  |
| `columns`          | `number`    | `12`           | Grid column count.               |
| `duration`         | `number`    | `0.8`          | Droplet animation duration.      |
| `staggerAmount`    | `number`    | `0.6`          | Wave completion time allocation. |
| `rotationRange`    | `number`    | `45`           | Random rotation variance.        |
| `translationRange` | `number`    | `25`           | Random translation variance.     |
| `ease`             | `string`    | `"sine.inOut"` | Easing curve.                    |

## 3. Core Component Source

**File Path:** `registry/ui/fluid-disintegration.tsx`

```tsx
"use client"

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
  const filterId = useMemo(() => `fluid-filter-${rawId.replace(/:/g, "")}`, [rawId])
  const patternId = useMemo(() => `fluid-pattern-${rawId.replace(/:/g, "")}`, [rawId])

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
          filter={`url(#${filterId})`}
          style={{ transform: "scale(1.02)", transformOrigin: "50% 50%" }}
        >
          {gridCells.map((cell) => (
            <rect
              key={cell.id}
              className="fluid-drop will-change-transform"
              x={`${cell.x}%`}
              y={`${cell.y}%`}
              style={{
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
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { FluidDisintegration } from "@/registry/ui/fluid-disintegration"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <FluidDisintegration
        imageUrl="/placeholder.jpg"
        rows={10}
        columns={16}
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2>Tada!</h2>
        </div>
      </FluidDisintegration>
    </main>
  )
}
```
