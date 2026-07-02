"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface ScatterTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls: string[]
  /** Distance the pointer must move (in pixels) before spawning a new item. @default 40 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 1500 */
  duration?: number
  /** Maximum items on screen before forcing the oldest to fade out. @default 20 */
  maxItems?: number
  /** The base pixel size of the image cards. @default 100 */
  itemSize?: number
  /** Multiplier for the throw distance based on mouse velocity. Higher = slides further. @default 120 */
  slideMultiplier?: number
  /** Absolute maximum pixels a card can slide to prevent flying off screen. @default 400 */
  maxSlide?: number
  /** How wide the angle of randomization is when a card is thrown (in radians). @default 0.7 */
  scatterSpread?: number
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
  /** Standard Tailwind classes applied to the individual image wrappers. */
  itemClassName?: string
}

interface TileData {
  active: boolean
  startX: number
  startY: number
  targetX: number
  targetY: number
  startRotation: number
  targetRotation: number
  imageIndex: number
  zIndex: number

  // State Machine Variables
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function ScatterTrail({
  imageUrls,
  distance = 40,
  duration = 1500,
  maxItems = 20,
  itemSize = 100,
  slideMultiplier = 120,
  maxSlide = 400,
  scatterSpread = 0.7,
  className,
  itemClassName = "",
}: ScatterTrailProps) {
  const reqRef = useRef<number | null>(null)

  // 3x pool size prevents active DOM nodes from being hijacked mid-exit animation
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      startRotation: 0,
      targetRotation: 0,
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
    lastMovePos: { x: -1000, y: -1000 },
    lastMoveTime: 0,
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
    slideMultiplier,
    maxSlide,
    scatterSpread,
  })
  useEffect(() => {
    config.current = {
      imageUrls,
      distance,
      maxItems,
      duration,
      itemSize,
      slideMultiplier,
      maxSlide,
      scatterSpread,
    }
  }, [
    imageUrls,
    distance,
    maxItems,
    duration,
    itemSize,
    slideMultiplier,
    maxSlide,
    scatterSpread,
  ])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      const now = Date.now()

      if (s.lastMovePos.x === -1000) {
        s.lastMovePos = { x: e.clientX, y: e.clientY }
        s.lastMoveTime = now
        return
      }

      // 1. Calculate Pointer Velocity (Pixels per millisecond)
      const moveDx = e.clientX - s.lastMovePos.x
      const moveDy = e.clientY - s.lastMovePos.y
      const dt = Math.max(now - s.lastMoveTime, 1)
      const vx = moveDx / dt
      const vy = moveDy / dt

      s.lastMovePos = { x: e.clientX, y: e.clientY }
      s.lastMoveTime = now

      const dropDx = e.clientX - s.lastDropPos.x
      const dropDy = e.clientY - s.lastDropPos.y
      const dropDistance = Math.hypot(dropDx, dropDy)

      if (dropDistance >= c.distance) {
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

          // 2. Casino Throw Physics
          const speed = Math.hypot(vx, vy)
          // Cap the slide distance so it doesn't fly off the monitor completely
          const slideDistance = Math.min(speed * c.slideMultiplier, c.maxSlide)

          // Base angle of movement
          const baseAngle = Math.atan2(vy, vx)
          // Add a random "scatter spread"
          const spreadAngle =
            baseAngle + (Math.random() - 0.5) * c.scatterSpread

          const targetX = e.clientX + Math.cos(spreadAngle) * slideDistance
          const targetY = e.clientY + Math.sin(spreadAngle) * slideDistance

          // The faster you throw, the more it spins (randomized left or right)
          const startRotation = (Math.random() - 0.5) * 90
          const spinDirection = Math.random() > 0.5 ? 1 : -1
          const spinAmount = slideDistance * 0.8 * spinDirection

          pool.current[freeIndex] = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            targetX,
            targetY,
            startRotation,
            targetRotation: startRotation + spinAmount,
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

      // A longer enter duration allows the "sliding friction" to visibly occur over time
      const enterDuration = c.duration * 0.35
      const holdDuration = c.duration * 0.45
      const exitDuration = c.duration * 0.2

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

        let currentX = item.startX
        let currentY = item.startY
        let currentRotation = item.startRotation
        let scale = 1
        let opacity = 1

        if (item.state === "enter") {
          // Quartic ease-out creates beautiful "sliding friction" physics
          // It starts fast, then heavily decelerates to a stop
          const easeOutFriction = 1 - Math.pow(1 - item.t, 4)

          currentX =
            item.startX + (item.targetX - item.startX) * easeOutFriction
          currentY =
            item.startY + (item.targetY - item.startY) * easeOutFriction
          currentRotation =
            item.startRotation +
            (item.targetRotation - item.startRotation) * easeOutFriction

          // Very slight scale pop on spawn to make it feel like it was thrown downward onto the table
          scale = 0.9 + easeOutFriction * 0.1
        } else if (item.state === "hold") {
          currentX = item.targetX
          currentY = item.targetY
          currentRotation = item.targetRotation
          scale = 1
        } else if (item.state === "exit") {
          currentX = item.targetX
          currentY = item.targetY
          currentRotation = item.targetRotation

          // Ease in shrink
          const easeIn = item.t * item.t
          scale = easeIn
          opacity = item.t
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()
        domNode.style.transform = `
          translate3d(${currentX}px, ${currentY}px, 0) 
          rotate(${currentRotation}deg) 
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
