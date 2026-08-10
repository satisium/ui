# Depth Trail Component Context

**Description:** A cinematic mouse trail leveraging Z-depth mapping, focal blur, parallax shifting, and atmospheric lighting to simulate a rich, dense 3D space.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add depth-trail
```

**Dependencies installed:** `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type       | Default | Description                                                            |
| :-------------- | :--------- | :------ | :--------------------------------------------------------------------- |
| `imageUrls`     | `string[]` | `[]`    | Array of image URLs to randomly spawn.                                 |
| `distance`      | `number`   | `40`    | Distance the pointer must move (in pixels) before spawning a new item. |
| `duration`      | `number`   | `2000`  | The total lifespan of a spawned item in milliseconds.                  |
| `maxItems`      | `number`   | `20`    | Maximum items on screen before forcing the oldest to fade out.         |
| `itemSize`      | `number`   | `90`    | The base pixel size of the image cards.                                |
| `rotationRange` | `number`   | `25`    | Maximum random rotation (in degrees) applied to the cards.             |
| `className`     | `string`   | `""`    | Optional standard Tailwind classes for the wrapper.                    |
| `itemClassName` | `string`   | `""`    | Optional standard Tailwind classes for the individual image cards.     |

## 3. Core Component Source

**File Path:** `components/ui/depth-trail.tsx`

```tsx
"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export interface DepthTrailProps {
  imageUrls: string[]
  distance?: number
  duration?: number
  maxItems?: number
  itemSize?: number
  rotationRange?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  baseX: number
  baseY: number
  zDepth: number
  rotation: number
  imageIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function DepthTrail({
  imageUrls,
  distance = 40,
  duration = 2000,
  maxItems = 20,
  itemSize = 90,
  rotationRange = 25,
  className,
  itemClassName = "",
}: DepthTrailProps) {
  const reqRef = useRef<number | null>(null)
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      baseX: 0,
      baseY: 0,
      zDepth: 0,
      rotation: 0,
      imageIndex: 0,
      t: 0,
      state: "enter",
      holdTime: 0,
      spawnTime: 0,
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef({
    lastDropPos: { x: -1000, y: -1000 },
    currentMouse: { x: -1000, y: -1000 },
    spawnCount: 0,
    lastFrameTime: 0,
  })

  const config = useRef({ imageUrls, distance, maxItems, duration, itemSize, rotationRange })
  useEffect(() => {
    config.current = { imageUrls, distance, maxItems, duration, itemSize, rotationRange }
  }, [imageUrls, distance, maxItems, duration, itemSize, rotationRange])

  useEffect(() => {
    state.current.currentMouse = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }

    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      s.currentMouse = { x: e.clientX, y: e.clientY }

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

          const rawDepth = Math.random()
          const zDepth = Math.pow(rawDepth, 1.2)

          pool.current[freeIndex] = {
            active: true,
            baseX: e.clientX,
            baseY: e.clientY,
            zDepth,
            rotation: (Math.random() - 0.5) * (c.rotationRange * 2),
            imageIndex: s.spawnCount % c.imageUrls.length,
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

      const enterDuration = c.duration * 0.15
      const holdDuration = c.duration * 0.55
      const exitDuration = c.duration * 0.3

      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const mouseOffsetX = state.current.currentMouse.x - centerX
      const mouseOffsetY = state.current.currentMouse.y - centerY

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

        const isEnter = item.state === "enter"
        const baseScale = isEnter
          ? 1 - Math.pow(1 - item.t, 3)
          : item.t * item.t
        const opacity = item.t

        const depthScale = 0.35 + item.zDepth * 1.45
        const finalScale = baseScale * depthScale

        let blurAmount = 0
        if (item.zDepth > 0.8) {
          blurAmount = (item.zDepth - 0.8) * 40
        } else if (item.zDepth < 0.4) {
          blurAmount = (0.4 - item.zDepth) * 15
        }

        const brightness = 0.3 + item.zDepth * 0.7

        const parallaxX = mouseOffsetX * (item.zDepth * -0.15)
        const parallaxY = mouseOffsetY * (item.zDepth * -0.15)

        const timeAlive = currentTime - item.spawnTime
        const driftY = timeAlive * (0.02 + item.zDepth * 0.03) * -1

        const x = item.baseX + parallaxX
        const y = item.baseY + parallaxY + driftY

        domNode.style.display = "flex"
        domNode.style.zIndex = Math.floor(item.zDepth * 100).toString()
        domNode.style.opacity = opacity.toString()
        domNode.style.filter = `blur(${blurAmount}px) brightness(${brightness})`

        domNode.style.transform = `
          translate3d(${x}px, ${y}px, 0)
          rotate(${item.rotation}deg)
          scale(${finalScale})
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
            borderRadius: "22%",
            display: "none",
            willChange: "transform, filter, opacity"
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

import DepthTrail from "@/components/ui/depth-trail"

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
          Cinematic Depth.
        </h1>
      </div>

      <DepthTrail
        imageUrls={trailImages}
        distance={300}
        maxItems={25}
        duration={2400}
        itemSize={90}
        rotationRange={45}
      />
    </main>
  )
}
```
