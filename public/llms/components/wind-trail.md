# Wind Trail Component Context

**Description:** An interactive mouse trail that maps spawned elements to an ambient wind physics engine, drifting items smoothly across the screen like autumn leaves.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add wind-trail
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type       | Default | Description                                                            |
| :-------------- | :--------- | :------ | :--------------------------------------------------------------------- |
| `imageUrls`     | `string[]` | `[]`    | Array of image URLs to randomly spawn.                                 |
| `distance`      | `number`   | `200`   | Distance the pointer must move (in pixels) before spawning a new item. |
| `duration`      | `number`   | `2600`  | The total lifespan of a spawned item in milliseconds.                  |
| `maxItems`      | `number`   | `10`    | Maximum items on screen before forcing the oldest to fade out.         |
| `itemSize`      | `number`   | `90`    | The base pixel size of the image cards.                                |
| `windX`         | `number`   | `100`   | Base horizontal wind speed in pixels per second.                       |
| `windY`         | `number`   | `-30`   | Base vertical wind speed in pixels per second.                         |
| `className`     | `string`   | `""`    | Optional standard Tailwind classes for the wrapper.                    |
| `itemClassName` | `string`   | `""`    | Optional standard Tailwind classes for the individual image cards.     |

## 3. Core Component Source

**File Path:** `components/ui/wind-trail.tsx`

```tsx
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface WindTrailProps {
  imageUrls?: string[]
  distance?: number
  duration?: number
  maxItems?: number
  itemSize?: number
  windX?: number
  windY?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  x: number
  y: number
  driftX: number
  driftY: number
  rotation: number
  flutterOffset: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function WindTrail({
  imageUrls = [],
  distance = 200,
  duration = 2600,
  maxItems = 10,
  itemSize = 90,
  windX = 100,
  windY = -30,
  className,
  itemClassName = "",
}: WindTrailProps) {
  const reqRef = useRef<number | null>(null)
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      driftX: 0,
      driftY: 0,
      rotation: 0,
      flutterOffset: 0,
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

  const config = useRef({ imageUrls, distance, maxItems, duration, itemSize, windX, windY })
  useEffect(() => {
    config.current = { imageUrls, distance, maxItems, duration, itemSize, windX, windY }
  }, [imageUrls, distance, maxItems, duration, itemSize, windX, windY])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current

      if (c.imageUrls.length === 0) return

      const dy = e.clientY - s.lastDropPos.y
      const dx = e.clientX - s.lastDropPos.x
      const moveDist = Math.hypot(dx, dy)

      if (moveDist >= c.distance) {
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
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          pool.current[freeIndex] = {
            active: true,
            x: e.clientX,
            y: e.clientY,
            driftX: 0,
            driftY: 0,
            rotation: (Math.random() - 0.5) * 60,
            flutterOffset: Math.random() * Math.PI * 2,
            imageIndex: s.spawnCount % c.imageUrls.length,
            zIndex: s.spawnCount,
            t: 0,
            state: "enter",
            holdTime: 0,
            spawnTime: Date.now(),
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

      const dt = delta / 1000

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

        if (item.state === "enter") {
          const easeOut = Math.sin((item.t * Math.PI) / 2)
          scale = 0.8 + easeOut * 0.2
          opacity = easeOut
        } else if (item.state === "hold") {
          scale = 1
          opacity = 1
        } else if (item.state === "exit") {
          const easeIn = item.t * item.t
          scale = easeIn
          opacity = item.t
        }

        const turbulenceX = Math.sin(currentTime * 0.002 + item.flutterOffset) * 40
        const turbulenceY = Math.cos(currentTime * 0.002 + item.flutterOffset) * 20

        const windMultiplier = item.state === "exit" ? 1 + (1 - item.t) * 2 : 1

        item.driftX += (c.windX + turbulenceX) * dt * windMultiplier
        item.driftY += (c.windY + turbulenceY) * dt * windMultiplier

        const flutterRotation = Math.sin(currentTime * 0.003 + item.flutterOffset) * 60
        item.rotation += flutterRotation * dt * windMultiplier

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()

        domNode.style.transform = `
          translate3d(${item.x + item.driftX}px, ${item.y + item.driftY}px, 0)
          rotate(${item.rotation}deg)
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
            borderRadius: "15%",
            display: "none",
            willChange: "transform, opacity",
          }}
        >
          {imageUrls.map((src, imgIndex) => (
            <img
              key={imgIndex}
              src={src}
              alt="trail"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full rounded-[15%] object-cover"
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

import WindTrail from "@/components/ui/wind-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/14.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/17.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/18.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/19.jpg",
]

export default function ExamplePage() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Autumn Gust.
        </h1>
      </div>

      <WindTrail
        imageUrls={trailImages}
        distance={200}
        maxItems={10}
        duration={2600}
        itemSize={120}
        windX={100}
        windY={-30}
        itemClassName="border-[6px] border-white/95 shadow-2xl rounded-sm"
      />
    </main>
  )
}
```
