# Ferrofluid Drag Component Context

**Description:** An interactive image transition component for Satis UI. Applies a mathematical SVG Gooey filter to a grid of beads. On hover, the beads calculate their proximity to the cursor and violently tear outward like magnetic fluid, revealing the content underneath. Utilizes GSAP `contextSafe` for strict memory management and ARIA presentation standards for screen readers.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/ferrofluid-drag.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type        | Default        | Description                      |
| :-------------- | :---------- | :------------- | :------------------------------- |
| `imageUrl`      | `string`    | _Required_     | The top image URL.               |
| `children`      | `ReactNode` | _Required_     | Reveal content.                  |
| `columns`       | `number`    | `12`           | Grid column count.               |
| `rows`          | `number`    | `12`           | Grid row count.                  |
| `duration`      | `number`    | `1.2`          | Tear animation duration.         |
| `staggerAmount` | `number`    | `0.4`          | Wave completion time allocation. |
| `ease`          | `string`    | `"power2.out"` | Easing curve.                    |

## 3. Core Component Source

**File Path:** `components/ui/ferrofluid-drag.tsx`

```tsx
"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface FerrofluidDragProps
  extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  children: React.ReactNode
  columns?: number
  rows?: number
  duration?: number
  staggerAmount?: number
  ease?: string
  className?: string
}

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

  const rawId = useId()
  const filterId = useMemo(() => `tear-filter-${rawId.replace(/:/g, "")}`, [rawId])
  const maskId = useMemo(() => `tear-mask-${rawId.replace(/:/g, "")}`, [rawId])

  const cells = useMemo(() => {
    return Array.from({ length: columns * rows }).map((_, i) => {
      const col = i % columns
      const row = Math.floor(i / columns)
      return {
        id: i,
        cx: `${(col / (columns - 1)) * 100}%`,
        cy: `${(row / (rows - 1)) * 100}%`,
        rawCx: (col / (columns - 1)) * 100,
        rawCy: (row / (rows - 1)) * 100,
      }
    })
  }, [columns, rows])

  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleMouseEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    if (tl.current && tl.current.progress() > 0 && tl.current.progress() < 1) {
      tl.current.play()
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    const col = Math.max(
      0,
      Math.min(columns - 1, Math.round((cursorX / rect.width) * (columns - 1)))
    )
    const row = Math.max(
      0,
      Math.min(rows - 1, Math.round((cursorY / rect.height) * (rows - 1)))
    )
    const startIndex = row * columns + col

    const circles = gsap.utils.toArray(".tear-bead", containerRef.current)

    if (tl.current) tl.current.kill()

    tl.current = gsap.timeline()

    tl.current.to(circles, {
      x: (i, target) => {
        const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
        const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
        const dx = cx - cursorX
        const dy = cy - cursorY
        const angle = Math.atan2(dy, dx)
        const dist = Math.hypot(dx, dy) || 1

        const pushForce = Math.max(100, 350 - dist) + gsap.utils.random(0, 100)
        return Math.cos(angle) * pushForce
      },
      y: (i, target) => {
        const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
        const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
        const dx = cx - cursorX
        const dy = cy - cursorY
        const angle = Math.atan2(dy, dx)
        const dist = Math.hypot(dx, dy) || 1

        const pushForce = Math.max(100, 350 - dist) + gsap.utils.random(0, 100)
        return Math.sin(angle) * pushForce
      },
      scale: 0,
      duration: duration,
      ease: ease,
      force3D: true,
      stagger: {
        amount: staggerAmount,
        grid: [rows, columns],
        from: startIndex,
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
        "relative shrink-0 cursor-pointer overflow-hidden bg-background",
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
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
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

        <g mask={`url(#${maskId})`}>
          <rect x="0" y="0" width="100%" height="100%" className="fill-current text-muted" />
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
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { FerrofluidDrag } from "@/components/ui/ferrofluid-drag"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <FerrofluidDrag
        imageUrl="/placeholder.jpg"
        columns={16}
        rows={10}
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2>Tada!</h2>
        </div>
      </FerrofluidDrag>
    </main>
  )
}
```
