"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface WindTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls?: string[]
  /** Distance the pointer must move (in pixels) before spawning a new item. @default 200 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 2600 */
  duration?: number
  /** Maximum items on screen before forcing the oldest to fade out. @default 10 */
  maxItems?: number
  /** The base pixel size of the image cards. @default 90 */
  itemSize?: number
  /** Base horizontal wind speed (pixels per second). @default 100 */
  windX?: number
  /** Base vertical wind speed (pixels per second). @default -30 */
  windY?: number
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
  /** Standard Tailwind classes applied to the individual image wrappers. */
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

  // State Machine Variables
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function WindTrail({
  imageUrls = [], // Fallback prevents runtime .map() errors
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

  // 3x pool size prevents active DOM nodes from being hijacked mid-exit animation
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

  // Mutable config ref avoids restarting the RAF loop on prop changes
  const config = useRef({
    imageUrls,
    distance,
    maxItems,
    duration,
    itemSize,
    windX,
    windY,
  })
  useEffect(() => {
    config.current = {
      imageUrls,
      distance,
      maxItems,
      duration,
      itemSize,
      windX,
      windY,
    }
  }, [imageUrls, distance, maxItems, duration, itemSize, windX, windY])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current

      // Prevent spawning if there are no images
      if (c.imageUrls.length === 0) return

      const dy = e.clientY - s.lastDropPos.y
      const dx = e.clientX - s.lastDropPos.x
      const moveDist = Math.hypot(dx, dy)

      if (moveDist >= c.distance) {
        // Intercept logic: force oldest active card to exit if limit hit
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
            rotation: (Math.random() - 0.5) * 60, // Initial messy rotation
            flutterOffset: Math.random() * Math.PI * 2, // Randomize sine wave start phase
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

    // Unified pointer events for touch & mouse compatibility
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

      const dt = delta / 1000 // Delta time in seconds for frame-independent physics

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

        // Bi-Directional Time Scrubber
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

        // LIFECYCLE MATH
        if (item.state === "enter") {
          // Soft pop in
          const easeOut = Math.sin((item.t * Math.PI) / 2)
          scale = 0.8 + easeOut * 0.2
          opacity = easeOut
        } else if (item.state === "hold") {
          scale = 1
          opacity = 1
        } else if (item.state === "exit") {
          // Shrinks and fades as if blowing far away
          const easeIn = item.t * item.t
          scale = easeIn
          opacity = item.t
        }

        // --------------------------------------------------------
        // AMBIENT PHYSICS & WIND ENGINE
        // --------------------------------------------------------

        // 1. Base wind + turbulence. The sine wave causes the item to sway left and right in the gust.
        const turbulenceX =
          Math.sin(currentTime * 0.002 + item.flutterOffset) * 40
        const turbulenceY =
          Math.cos(currentTime * 0.002 + item.flutterOffset) * 20

        // 2. Wind Multiplier: Wind grabs it significantly harder when it dies (exit state)
        const windMultiplier = item.state === "exit" ? 1 + (1 - item.t) * 2 : 1

        // Accumulate drift per frame
        item.driftX += (c.windX + turbulenceX) * dt * windMultiplier
        item.driftY += (c.windY + turbulenceY) * dt * windMultiplier

        // Accumulate flutter rotation per frame
        const flutterRotation =
          Math.sin(currentTime * 0.003 + item.flutterOffset) * 60
        item.rotation += flutterRotation * dt * windMultiplier

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()

        domNode.style.transform = `
          translate3d(${item.x + item.driftX}px, ${item.y + item.driftY}px, 0) 
          rotate(${item.rotation}deg) 
          scale(${scale})
        `

        // Reveal the correct image in the DOM without re-rendering React
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

  // Preload images safely avoiding CORS/Hotlink cache collisions
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
