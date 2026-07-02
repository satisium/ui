"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface SquircleTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls?: string[]
  /** Distance the pointer must move (in pixels) before spawning a new item. @default 30 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 1200 */
  duration?: number
  /** Maximum items on screen before forcing the oldest to fade out. @default 7 */
  maxItems?: number
  /** The base pixel size of the image cards. @default 120 */
  itemSize?: number
  /** Maximum random rotation (in degrees) applied to the cards. @default 15 */
  rotationRange?: number
  /**
   * false = random jitter based on rotationRange.
   * true = perfectly follows mouse direction (defaults to +90deg offset).
   * number = follows mouse with your exact degree offset!
   * @default false
   */
  directionalRotation?: boolean | number
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
  /** Standard Tailwind classes applied to the individual image wrappers. */
  itemClassName?: string
}

interface TileData {
  active: boolean
  x: number
  y: number
  rotation: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function SquircleTrail({
  imageUrls = [], // Fallback prevents runtime .map() errors
  distance = 30,
  duration = 1200,
  maxItems = 7,
  itemSize = 120,
  rotationRange = 15,
  directionalRotation = false,
  className,
  itemClassName = "",
}: SquircleTrailProps) {
  const reqRef = useRef<number | null>(null)

  // 3x pool size prevents active DOM nodes from being hijacked mid-exit animation
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      rotation: 0,
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
    rotationRange,
    directionalRotation,
  })
  useEffect(() => {
    config.current = {
      imageUrls,
      distance,
      maxItems,
      duration,
      itemSize,
      rotationRange,
      directionalRotation,
    }
  }, [
    imageUrls,
    distance,
    maxItems,
    duration,
    itemSize,
    rotationRange,
    directionalRotation,
  ])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current

      if (c.imageUrls.length === 0) return

      const dy = e.clientY - s.lastDropPos.y
      const dx = e.clientX - s.lastDropPos.x
      const moveDist = Math.hypot(dx, dy)

      if (moveDist >= c.distance) {
        // 1. INTERCEPT LOGIC: Force oldest active card to exit
        const activeNonExiting = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        if (activeNonExiting.length >= c.maxItems) {
          activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
          const oldest = activeNonExiting[0]
          oldest.state = "exit"
        }

        // 2. SPAWN NEW TILE
        const freeIndex = pool.current.findIndex((p) => !p.active)
        if (freeIndex !== -1) {
          const isFirstDrop = s.lastDropPos.x === -1000
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          const pathAngle = Math.atan2(dy, dx) * (180 / Math.PI)
          const offset =
            typeof c.directionalRotation === "number"
              ? c.directionalRotation
              : 90

          pool.current[freeIndex] = {
            active: true,
            x: e.clientX,
            y: e.clientY,
            rotation:
              c.directionalRotation !== false
                ? isFirstDrop
                  ? 0
                  : pathAngle + offset
                : (Math.random() - 0.5) * (c.rotationRange * 2),
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

      const enterDuration = c.duration * 0.2
      const holdDuration = c.duration * 0.6
      const exitDuration = c.duration * 0.2

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

        const scale = Math.max(0, item.t)

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.transform = `
          translate3d(${item.x}px, ${item.y}px, 0) 
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
            borderRadius: "22%",
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
              className="absolute inset-0 h-full w-full rounded-[15%] object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
