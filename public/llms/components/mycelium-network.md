# Mycelium Network Component Context

**Description:** An interactive image transition component for Satis UI. Connects an SVG grid of nodes and edges masked with a mathematical gooey filter. On hover, it calculates the cursor's origin and triggers a radiating physics simulation where edges snap and nodes organically drift outward. Utilizes GSAP `contextSafe` for strict memory management and ARIA presentation standards for screen readers.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/mycelium-network.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop                | Type        | Default    | Description                   |
| :------------------ | :---------- | :--------- | :---------------------------- |
| `imageUrl`          | `string`    | _Required_ | The top image URL.            |
| `children`          | `ReactNode` | _Required_ | Reveal content.               |
| `columns`           | `number`    | `16`       | Grid column count.            |
| `rows`              | `number`    | `9`        | Grid row count.               |
| `edgeThickness`     | `string`    | `"20%"`    | Web lines starting thickness. |
| `nodeRadius`        | `string`    | `"15%"`    | Anchor nodes starting radius. |
| `duration`          | `number`    | `1.2`      | Snap animation base duration. |
| `staggerMultiplier` | `number`    | `0.7`      | Outward ripple speed control. |

## 3. Core Component Source

**File Path:** `components/ui/mycelium-network.tsx`

```tsx
"use client"

import React, { useRef, useMemo, useId } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

export interface MyceliumNetworkProps
  extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  children: React.ReactNode
  columns?: number
  rows?: number
  edgeThickness?: string
  nodeRadius?: string
  duration?: number
  staggerMultiplier?: number
  className?: string
}

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

  const rawId = useId()
  const filterId = useMemo(() => `mycelium-filter-${rawId.replace(/:/g, "")}`, [rawId])
  const maskId = useMemo(() => `mycelium-mask-${rawId.replace(/:/g, "")}`, [rawId])

  const { nodes, edges } = useMemo(() => {
    const nodesArr = []
    const edgesArr = []

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

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const idx = r * columns + c
        const n1 = nodesArr[idx]

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
    const maxDist = Math.hypot(rect.width, rect.height)

    const domEdges = gsap.utils.toArray(".mycelium-edge", containerRef.current)
    const domNodes = gsap.utils.toArray(".mycelium-node", containerRef.current)

    if (tl.current) tl.current.kill()
    tl.current = gsap.timeline()

    tl.current.to(
      domEdges,
      {
        attr: { "stroke-width": 0 },
        duration: duration * 0.4,
        ease: "power2.in",
        delay: (i, target) => {
          const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
          const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
          const dist = Math.hypot(cx - cursorX, cy - cursorY)
          return (dist / maxDist) * staggerMultiplier
        },
      },
      0
    )

    tl.current.to(
      domNodes,
      {
        attr: {
          r: 0,
          cy: (i, target) => `${parseFloat(target.dataset.cy) - gsap.utils.random(15, 30)}%`,
          cx: (i, target) => `${parseFloat(target.dataset.cx) + gsap.utils.random(-15, 15)}%`,
        },
        duration: duration,
        ease: "power2.out",
        delay: (i, target) => {
          const cx = (parseFloat(target.dataset.cx) / 100) * rect.width
          const cy = (parseFloat(target.dataset.cy) / 100) * rect.height
          const dist = Math.hypot(cx - cursorX, cy - cursorY)
          return (dist / maxDist) * staggerMultiplier + 0.15
        },
      },
      0
    )
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
                  strokeWidth={edgeThickness}
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
                  r={nodeRadius}
                  fill="white"
                />
              ))}
            </g>
          </mask>
        </defs>

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
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { MyceliumNetwork } from "@/components/ui/mycelium-network"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MyceliumNetwork
        imageUrl="/placeholder.jpg"
        columns={16}
        rows={9}
        duration={1.2}
        staggerMultiplier={0.7}
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2>Tada!</h2>
        </div>
      </MyceliumNetwork>
    </main>
  )
}
```
