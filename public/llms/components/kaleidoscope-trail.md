# Kaleidoscope Trail Component Context

**Description:** A geometrically mapped mouse trail that perfectly mirrors spawned elements around the center axis, creating mesmerizing kaleidoscope mandalas.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/kaleidoscope-trail.json
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type       | Default | Description                                                               |
| :-------------- | :--------- | :------ | :------------------------------------------------------------------------ |
| `imageUrls`     | `string[]` | `[]`    | Array of image URLs to randomly spawn.                                    |
| `distance`      | `number`   | `40`    | Distance the pointer must move (in pixels) before spawning a new cluster. |
| `duration`      | `number`   | `2000`  | The total lifespan of a spawned item in milliseconds.                     |
| `maxGroups`     | `number`   | `12`    | Maximum number of clusters on screen before forcing the oldest to exit.   |
| `mirrors`       | `number`   | `6`     | How many reflections to create around the center (e.g., 6 = Hexagon).     |
| `itemSize`      | `number`   | `90`    | The base pixel size of the image cards.                                   |
| `className`     | `string`   | `""`    | Optional standard Tailwind classes for the wrapper.                       |
| `itemClassName` | `string`   | `""`    | Optional standard Tailwind classes for the individual image cards.        |

## 3. Core Component Source

**File Path:** `components/ui/kaleidoscope-trail.tsx`

```tsx
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface KaleidoscopeTrailProps {
  imageUrls?: string[]
  distance?: number
  duration?: number
  maxGroups?: number
  mirrors?: number
  itemSize?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  x: number
  y: number
  baseRotation: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function KaleidoscopeTrail({
  imageUrls = [],
  distance = 40,
  duration = 2000,
  maxGroups = 12,
  mirrors = 6,
  itemSize = 90,
  className,
  itemClassName = "",
}: KaleidoscopeTrailProps) {
  const reqRef = useRef<number | null>(null)
  const DOM_POOL_SIZE = maxGroups * mirrors * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      baseRotation: 0,
      imageIndex: 0,
      zIndex: 0,
      t: 0,
      state: "enter",
      holdTime: 0,
      spawnTime: 0,
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef({
    lastDropPos: { x: -1000, y: -1000 },
    spawnCount: 0,
    lastFrameTime: 0,
  })

  const config = useRef({ imageUrls, distance, maxGroups, duration, itemSize, mirrors })
  useEffect(() => {
    config.current = { imageUrls, distance, maxGroups, duration, itemSize, mirrors }
  }, [imageUrls, distance, maxGroups, duration, itemSize, mirrors])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current

      if (c.imageUrls.length === 0) return

      const dy = e.clientY - s.lastDropPos.y
      const dx = e.clientX - s.lastDropPos.x
      const moveDist = Math.hypot(dx, dy)

      if (moveDist >= c.distance) {
        const activeCards = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        if (activeCards.length >= c.maxGroups * c.mirrors) {
          activeCards.sort((a, b) => a.spawnTime - b.spawnTime)
          for (let i = 0; i < c.mirrors; i++) {
            if (activeCards[i]) activeCards[i].state = "exit"
          }
        }

        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2

        const mx = e.clientX - cx
        const my = e.clientY - cy

        const radius = Math.hypot(mx, my)
        const baseAngle = Math.atan2(my, mx)

        s.lastDropPos = { x: e.clientX, y: e.clientY }
        s.spawnCount += 1

        const spawnTime = Date.now()
        const imageIndex = s.spawnCount % c.imageUrls.length

        for (let i = 0; i < c.mirrors; i++) {
          const freeIndex = pool.current.findIndex((p) => !p.active)
          if (freeIndex !== -1) {
            const angleOffset = (i * 2 * Math.PI) / c.mirrors
            const finalAngle = baseAngle + angleOffset

            const symX = cx + radius * Math.cos(finalAngle)
            const symY = cy + radius * Math.sin(finalAngle)

            const rotationDeg = finalAngle * (180 / Math.PI) + 90

            pool.current[freeIndex] = {
              active: true,
              x: symX,
              y: symY,
              baseRotation: rotationDeg,
              imageIndex,
              zIndex: s.spawnCount,
              t: 0,
              state: "enter",
              holdTime: 0,
              spawnTime,
            }
          }
        }
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  useEffect(() => {
    state.current.lastFrameTime = Date.now()

    const animate = () => {
      const c = config.current
      const currentTime = Date.now()
      const delta = Math.min(currentTime - state.current.lastFrameTime, 32)
      state.current.lastFrameTime = currentTime

      const enterDuration = c.duration * 0.15
      const holdDuration = c.duration * 0.55
      const exitDuration = c.duration * 0.3

      for (let i = 0; i < DOM_POOL_SIZE; i++) {
        const item = pool.current[i]
        const domNode = domRefs.current[i]

        if (!domNode) continue
        if (!item.active) {
          domNode.style.display = "none"
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
            domNode.style.display = "none"
            continue
          }
        }

        let scale = 1
        let opacity = 1
        let currentRotation = item.baseRotation

        if (item.state === "enter") {
          const easeOut = 1 - Math.pow(1 - item.t, 3)
          scale = easeOut
          opacity = easeOut
        } else if (item.state === "hold") {
          const p = item.holdTime / holdDuration
          scale = 1 + Math.sin(p * Math.PI) * 0.1
          currentRotation = item.baseRotation + p * 45
          opacity = 1
        } else if (item.state === "exit") {
          const easeIn = item.t * item.t
          scale = easeIn
          currentRotation = item.baseRotation + 45 + (1 - item.t) * 90
          opacity = item.t
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()

        domNode.style.transform = `
          translate3d(${item.x}px, ${item.y}px, 0)
          rotate(${currentRotation}deg)
          scale(${scale})
        `

        const imagesInside = domNode.querySelectorAll("img")
        imagesInside.forEach((img, idx) => {
          img.style.display = idx === item.imageIndex ? "block" : "none"
        })
      }

      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [DOM_POOL_SIZE])

  useEffect(() => {
    imageUrls.forEach((src) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.referrerPolicy = "no-referrer"
      img.src = src
    })
  }, [imageUrls])

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
            "absolute top-0 left-0 overflow-hidden bg-transparent p-0 drop-shadow-2xl will-change-transform",
            itemClassName
          )}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            marginTop: `-${itemSize / 2}px`,
            borderRadius: "35%",
            display: "none",
          }}
        >
          {imageUrls.map((src, imgIndex) => (
            <img
              key={imgIndex}
              src={src}
              alt="trail"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full rounded-[35%] object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import KaleidoscopeTrail from "@/components/ui/kaleidoscope-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/16.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/17.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/18.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/19.png",
]

export default function ExamplePage() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Symmetry.
        </h1>
      </div>

      <KaleidoscopeTrail
        imageUrls={trailImages}
        distance={60}
        itemSize={110}
        maxGroups={5}
        mirrors={8}
        duration={2400}
      />
    </main>
  )
}
```
