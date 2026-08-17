# Pendulum Trail Component Context

**Description:** An interactive mouse trail that maps spawned items to an invisible swinging pendulum axis, driven entirely by pointer velocity and physics length.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/pendulum-trail.json
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type       | Default | Description                                                                 |
| :-------------- | :--------- | :------ | :-------------------------------------------------------------------------- |
| `imageUrls`     | `string[]` | `[]`    | Array of image URLs to randomly spawn.                                      |
| `distance`      | `number`   | `70`    | Distance the pointer must move (in pixels) before spawning a new item.      |
| `duration`      | `number`   | `3000`  | The total lifespan of a spawned item in milliseconds.                       |
| `maxItems`      | `number`   | `15`    | Maximum items on screen before forcing the oldest to gracefully shrink out. |
| `itemSize`      | `number`   | `110`   | The base pixel width of the image cards.                                    |
| `windAngle`     | `number`   | `10`    | Base horizontal wind angle pushing the cards.                               |
| `windSway`      | `number`   | `5`     | The intensity of the sine-wave flutter applied by the wind.                 |
| `physicsLength` | `number`   | `40`    | Length of the invisible string. Dictates the speed and arc of the swing.    |
| `className`     | `string`   | `""`    | Optional standard Tailwind classes for the wrapper.                         |
| `itemClassName` | `string`   | `""`    | Optional standard Tailwind classes for the individual image cards.          |

## 3. Core Component Source

**File Path:** `registry/ui/pendulum-trail.tsx`

```tsx
"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface PendulumTrailProps {
  imageUrls?: string[]
  distance?: number
  duration?: number
  maxItems?: number
  itemSize?: number
  windAngle?: number
  windSway?: number
  physicsLength?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  id: number
  x: number
  y: number
  vx: number
  flutterOffset: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function PendulumTrail({
  imageUrls = [],
  distance = 70,
  duration = 3000,
  maxItems = 15,
  itemSize = 110,
  windAngle = 10,
  windSway = 5,
  physicsLength = 40,
  className,
  itemClassName = "",
}: PendulumTrailProps) {
  const reqRef = useRef<number | null>(null)
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, (_, i) => ({
      active: false,
      id: i,
      x: 0,
      y: 0,
      vx: 0,
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
    smoothedMouse: { x: -1000, y: -1000 },
    actualMouse: { x: -1000, y: -1000 },
    lastDropPos: { x: -1000, y: -1000 },
    lastMoveTime: 0,
    spawnCount: 0,
    lastFrameTime: 0,
  })

  const config = useRef({ imageUrls, distance, duration, maxItems, itemSize, windAngle, windSway, physicsLength })
  useEffect(() => {
    config.current = { imageUrls, distance, duration, maxItems, itemSize, windAngle, windSway, physicsLength }
  }, [imageUrls, distance, duration, maxItems, itemSize, windAngle, windSway, physicsLength])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      const now = Date.now()

      if (c.imageUrls.length === 0) return

      if (s.actualMouse.x === -1000) {
        s.actualMouse = { x: e.clientX, y: e.clientY }
        s.smoothedMouse = { x: e.clientX, y: e.clientY }
        s.lastDropPos = { x: e.clientX, y: e.clientY }
        s.lastMoveTime = now
        return
      }

      const moveDx = e.clientX - s.actualMouse.x
      const dt = Math.max(now - s.lastMoveTime, 1)
      const vx = moveDx / dt

      s.actualMouse = { x: e.clientX, y: e.clientY }
      s.lastMoveTime = now

      const dropDx = e.clientX - s.lastDropPos.x
      const dropDy = e.clientY - s.lastDropPos.y
      const dropDistance = Math.hypot(dropDx, dropDy)

      if (dropDistance >= c.distance) {
        const activeNonExiting = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        if (activeNonExiting.length >= c.maxItems) {
          activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
          const oldest = activeNonExiting[0]
          oldest.state = "exit"
          oldest.t = 0
        }

        const freeIndex = pool.current.findIndex((p) => !p.active)
        if (freeIndex !== -1) {
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          pool.current[freeIndex] = {
            active: true,
            id: freeIndex,
            x: e.clientX,
            y: e.clientY,
            vx: vx,
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

      const s = state.current
      s.smoothedMouse.x += (s.actualMouse.x - s.smoothedMouse.x) * 0.15
      s.smoothedMouse.y += (s.actualMouse.y - s.smoothedMouse.y) * 0.15

      const enterDuration = c.duration * 0.1
      const holdDuration = c.duration * 0.7
      const exitDuration = c.duration * 0.2

      const currentPhysicsLength = Math.max(c.physicsLength, 15)
      const swingFrequency = Math.sqrt(640 / currentPhysicsLength)
      const velocityMultiplier = 60 / Math.sqrt(currentPhysicsLength)

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
            item.t = 0
          }
        } else if (item.state === "exit") {
          item.t += delta / exitDuration
          if (item.t >= 1) {
            item.t = 1
            item.active = false
            domNode.style.display = "none"
            continue
          }
        }

        const timeAlive = (currentTime - item.spawnTime) / 1000

        const baseAmplitude = item.vx * -velocityMultiplier
        const amplitude = Math.max(Math.min(baseAmplitude, 60), -60)
        const damping = 1.8

        const pendulumAngle =
          amplitude *
          Math.exp(-damping * timeAlive) *
          Math.cos(swingFrequency * timeAlive)

        const pendulumDepth =
          amplitude *
          Math.exp(-damping * timeAlive) *
          Math.sin(swingFrequency * timeAlive)

        const ambientWind =
          c.windAngle + Math.sin(timeAlive * 1.5 + item.flutterOffset) * c.windSway

        const finalRotation = pendulumAngle + ambientWind

        const depthScale = pendulumDepth / 45
        let visualScale = Math.max(1 + depthScale * 0.08, 0.5)

        let opacity = 1

        if (item.state === "enter") {
          const easeOut = Math.sin((item.t * Math.PI) / 2)
          visualScale *= easeOut
          opacity = item.t
        } else if (item.state === "exit") {
          const easeIn = 1 - item.t
          visualScale *= easeIn * easeIn
          opacity = easeIn
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()
        domNode.style.transform = `
          translate3d(${item.x}px, ${item.y}px, 0)
          rotate(${finalRotation}deg)
          scale(${visualScale})
        `

        const imagesInside = domNode.querySelectorAll<HTMLImageElement>("img.js-trail-img")
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
            "absolute top-0 left-0 flex flex-col items-center will-change-transform",
            itemClassName
          )}
          style={{
            width: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            transformOrigin: "50% -20px",
            display: "none",
          }}
        >
          <div
            className="relative flex flex-col drop-shadow-2xl"
            style={{
              width: "100%",
              height: `${itemSize * 1.3}px`,
              borderRadius: "6px",
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[6px]">
              {imageUrls.map((src, imgIndex) => (
                <img
                  key={imgIndex}
                  src={src}
                  alt="trail"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  className="js-trail-img absolute inset-0 h-full w-full object-cover"
                  style={{ display: "none" }}
                />
              ))}
            </div>
          </div>
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

import PendulumTrail from "@/registry/ui/pendulum-trail"

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
          Pendulum.
        </h1>
      </div>

      <PendulumTrail
        imageUrls={trailImages}
        distance={80}
        duration={3200}
        maxItems={12}
        itemSize={130}
        windAngle={-5}
        windSway={8}
        physicsLength={60}
        itemClassName="p-2 bg-background border border-border shadow-xl"
      />
    </main>
  )
}
```
