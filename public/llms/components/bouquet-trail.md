# Bouquet Trail Component Context

**Description:** A highly optimized, hardware-accelerated mouse trail component featuring SVG DOM pooling, bi-directional time scrubbing, and customizable spring physics.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add bouquet-trail
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type               | Default           | Description                                                               |
| :---------------- | :----------------- | :---------------- | :------------------------------------------------------------------------ |
| `elements`        | `ReactNode[]`      | `[]`              | Array of React Nodes (SVGs, Icons, Images) used as the trail particles.   |
| `colors`          | `string[]`         | `[...warmColors]` | Array of hex colors randomly applied to the elements dynamically.         |
| `itemSize`        | `number`           | `40`              | The base width and height of each item in pixels.                         |
| `scatterRadius`   | `number`           | `40`              | The maximum distance an item can spawn from the cursor's exact path.      |
| `distance`        | `number`           | `12`              | The distance the mouse must move in pixels before spawning the next item. |
| `maxItems`        | `number`           | `150`             | Maximum number of active items before forcing older ones to exit/shrink.  |
| `duration`        | `number`           | `2500`            | The total lifespan of an item from enter to exit in milliseconds.         |
| `scaleRange`      | `[number, number]` | `[0.5, 1.5]`      | The random scale range applied to items upon spawn.                       |
| `rotationRange`   | `number`           | `360`             | The maximum random rotation applied to items in degrees.                  |
| `enableBreathing` | `boolean`          | `true`            | Toggles the gentle sine-wave pulsing effect while items are active.       |
| `className`       | `string`           | `""`              | Optional standard Tailwind classes for the fixed wrapper.                 |

## 3. Core Component Source

**File Path:** `components/ui/bouquet-trail.tsx`

```tsx
"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const popEasing = (t: number) => {
  const c1 = 1.70158
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export interface BouquetTrailProps {
  elements?: React.ReactNode[]
  colors?: string[]
  itemSize?: number
  scatterRadius?: number
  distance?: number
  maxItems?: number
  duration?: number
  scaleRange?: [number, number]
  rotationRange?: number
  enableBreathing?: boolean
  className?: string
}

interface ParticleData {
  active: boolean
  x: number
  y: number
  color: string
  type: number
  rotation: number
  sizeMultiplier: number
  breathingOffset: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function BouquetTrail({
  elements = [],
  colors = ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea"],
  itemSize = 40,
  scatterRadius = 40,
  distance = 12,
  maxItems = 150,
  duration = 2500,
  scaleRange = [0.5, 1.5],
  rotationRange = 360,
  enableBreathing = true,
  className,
}: BouquetTrailProps) {
  const reqRef = useRef<number | null>(null)
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<ParticleData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      color: "",
      type: 0,
      rotation: 0,
      sizeMultiplier: 1,
      breathingOffset: 0,
      zIndex: 0,
      t: 0,
      state: "enter",
      holdTime: 0,
      spawnTime: 0,
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef({
    distanceAccumulator: 0,
    spawnCount: 0,
    cursorPos: { x: -1000, y: -1000 },
    prevCursorPos: { x: -1000, y: -1000 },
    targetPos: { x: -1000, y: -1000 },
    hasStarted: false,
    lastFrameTime: 0,
    lastMoveTime: 0,
  })

  const config = useRef({
    elements,
    colors,
    itemSize,
    scatterRadius,
    distance,
    duration,
    maxItems,
    scaleRange,
    rotationRange,
    enableBreathing,
  })

  useEffect(() => {
    config.current = {
      elements,
      colors,
      itemSize,
      scatterRadius,
      distance,
      duration,
      maxItems,
      scaleRange,
      rotationRange,
      enableBreathing,
    }
  }, [
    elements,
    colors,
    itemSize,
    scatterRadius,
    distance,
    duration,
    maxItems,
    scaleRange,
    rotationRange,
    enableBreathing,
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      state.current.targetPos = { x: e.clientX, y: e.clientY }
      if (!state.current.hasStarted) {
        state.current.cursorPos = { x: e.clientX, y: e.clientY }
        state.current.prevCursorPos = { x: e.clientX, y: e.clientY }
        state.current.hasStarted = true
        state.current.lastFrameTime = Date.now()
      }
    }

    window.addEventListener("pointermove", handleMouseMove as any)
    return () => window.removeEventListener("pointermove", handleMouseMove as any)
  }, [])

  useEffect(() => {
    const animate = () => {
      const s = state.current
      const c = config.current
      const currentTime = Date.now()

      const delta = Math.min(currentTime - s.lastFrameTime, 32)
      s.lastFrameTime = currentTime

      if (s.hasStarted) {
        s.cursorPos.x += (s.targetPos.x - s.cursorPos.x) * 0.3
        s.cursorPos.y += (s.targetPos.y - s.cursorPos.y) * 0.3

        const moveDx = s.cursorPos.x - s.prevCursorPos.x
        const moveDy = s.cursorPos.y - s.prevCursorPos.y
        const moveDist = Math.hypot(moveDx, moveDy)

        if (moveDist > 0.1) {
          s.distanceAccumulator += moveDist
          s.lastMoveTime = currentTime

          while (s.distanceAccumulator >= c.distance) {
            s.distanceAccumulator -= c.distance
            s.spawnCount += 1

            const activeNonExiting = pool.current.filter(
              (p) => p.active && p.state !== "exit"
            )

            if (activeNonExiting.length >= c.maxItems) {
              activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
              const oldest = activeNonExiting[0]
              oldest.state = "exit"
            }

            const freeIndex = pool.current.findIndex((p) => !p.active)

            if (freeIndex !== -1) {
              const fraction = 1 - s.distanceAccumulator / moveDist
              const interpolatedX = s.prevCursorPos.x + moveDx * fraction
              const interpolatedY = s.prevCursorPos.y + moveDy * fraction

              const angle = Math.random() * Math.PI * 2
              const radius = Math.random() * c.scatterRadius
              const spawnX = interpolatedX + Math.cos(angle) * radius
              const spawnY = interpolatedY + Math.sin(angle) * radius

              const [minScale, maxScale] = c.scaleRange

              pool.current[freeIndex] = {
                active: true,
                x: spawnX,
                y: spawnY,
                color: c.colors[Math.floor(Math.random() * c.colors.length)],
                type: c.elements.length
                  ? Math.floor(Math.random() * c.elements.length)
                  : 0,
                rotation: Math.random() * c.rotationRange,
                sizeMultiplier: minScale + Math.random() * (maxScale - minScale),
                breathingOffset: Math.random() * Math.PI * 2,
                zIndex: s.spawnCount,
                t: 0,
                state: "enter",
                holdTime: 0,
                spawnTime: currentTime,
              }
            }
          }
        } else {
          if (currentTime - s.lastMoveTime > 50) {
            for (let i = 0; i < DOM_POOL_SIZE; i++) {
              const item = pool.current[i]
              if (item.active && item.state !== "exit") {
                item.holdTime += delta * 2
              }
            }
          }
        }

        s.prevCursorPos.x = s.cursorPos.x
        s.prevCursorPos.y = s.cursorPos.y
      }

      const enterDuration = c.duration * 0.15
      const holdDuration = c.duration * 0.55
      const exitDuration = c.duration * 0.3

      for (let i = 0; i < DOM_POOL_SIZE; i++) {
        const item = pool.current[i]
        const domNode = domRefs.current[i]

        if (!domNode) continue

        if (!item.active) {
          domNode.style.opacity = "0"
          domNode.style.transform = `translate3d(-10000px, -10000px, 0)`
          continue
        }

        if (item.state === "enter") {
          item.t += delta / enterDuration
          if (item.t >= 1) {
            item.t = 1
            item.state = "hold"
          }
        } else if (item.state === "hold") {
          item.holdTime += delta
          if (item.holdTime >= holdDuration) {
            item.state = "exit"
          }
        } else if (item.state === "exit") {
          item.t -= delta / exitDuration
          if (item.t <= 0) {
            item.t = 0
            item.active = false
            domNode.style.opacity = "0"
            domNode.style.transform = `translate3d(-10000px, -10000px, 0)`
            continue
          }
        }

        let scale = 0

        if (item.state === "enter") {
          scale = Math.max(0, popEasing(item.t))
        } else if (item.state === "hold") {
          const breathe = c.enableBreathing
            ? Math.sin((currentTime / 1000) * 3 + item.breathingOffset) * 0.05
            : 0
          scale = 1 + breathe
        } else if (item.state === "exit") {
          scale = Math.max(0, item.t * item.t)
        }

        const finalScale = scale * item.sizeMultiplier

        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = "1"
        domNode.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg) scale(${finalScale})`

        if (c.elements.length > 0) {
          const shapesInside =
            domNode.querySelectorAll<HTMLElement>(".js-trail-item")
          shapesInside.forEach((shapeEl, idx) => {
            if (idx === item.type) {
              shapeEl.style.color = item.color
              shapeEl.style.opacity = "1"
            } else {
              shapeEl.style.opacity = "0"
            }
          })
        }
      }

      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [])

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] h-screen w-screen overflow-hidden",
        className
      )}
    >
      {Array.from({ length: DOM_POOL_SIZE }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            domRefs.current[i] = el
          }}
          className={cn(
            "absolute top-0 left-0 flex origin-center items-center justify-center will-change-transform"
          )}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            marginTop: `-${itemSize / 2}px`,
            opacity: 0,
            transform: "translate3d(-10000px, -10000px, 0)",
          }}
        >
          {elements.map((element, elementIndex) => (
            <div
              key={elementIndex}
              className="js-trail-item absolute inset-0 flex items-center justify-center text-current drop-shadow-md transition-none"
              style={{ opacity: 0 }}
            >
              {element}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```
