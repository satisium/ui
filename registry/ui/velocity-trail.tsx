"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface VelocityTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls?: string[]
  /** Distance the pointer must move (in pixels) before spawning a new item. @default 40 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 800 */
  duration?: number
  /** Maximum items on screen before forcing the oldest to fade out. @default 15 */
  maxItems?: number
  /** The base pixel size of the image cards. @default 96 */
  itemSize?: number
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
  speed: number
  imageIndex: number
  zIndex: number

  // State Machine Variables
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function VelocityTrail({
  imageUrls = [], // Fallback prevents runtime .map() errors
  distance = 40,
  duration = 800,
  maxItems = 15,
  itemSize = 96,
  className,
  itemClassName = "",
}: VelocityTrailProps) {
  const reqRef = useRef<number | null>(null)

  // 3x pool size prevents active DOM nodes from being hijacked mid-exit animation
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      rotation: 0,
      speed: 0,
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
  const config = useRef({ imageUrls, distance, maxItems, duration, itemSize })
  useEffect(() => {
    config.current = { imageUrls, distance, maxItems, duration, itemSize }
  }, [imageUrls, distance, maxItems, duration, itemSize])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      const now = Date.now()

      if (c.imageUrls.length === 0) return

      // Calculate real-time pointer velocity
      if (s.lastMovePos.x === -1000) {
        s.lastMovePos = { x: e.clientX, y: e.clientY }
        s.lastMoveTime = now
        return
      }

      const moveDx = e.clientX - s.lastMovePos.x
      const moveDy = e.clientY - s.lastMovePos.y
      const moveDistance = Math.hypot(moveDx, moveDy)
      const dt = Math.max(now - s.lastMoveTime, 1) // Prevent division by zero

      // Speed in pixels per millisecond (typically ranges from 0 to ~5)
      const speed = Math.min(moveDistance / dt, 5)

      // Trajectory angle to strictly align the stretch direction
      const trajectoryAngle = Math.atan2(moveDy, moveDx) * (180 / Math.PI)

      s.lastMovePos = { x: e.clientX, y: e.clientY }
      s.lastMoveTime = now

      // Spawn logic
      const dropDx = e.clientX - s.lastDropPos.x
      const dropDy = e.clientY - s.lastDropPos.y
      const dropDistance = Math.hypot(dropDx, dropDy)

      if (dropDistance >= c.distance) {
        const activeNonExiting = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        // Intercept logic: force oldest active card to exit if limit hit
        if (activeNonExiting.length >= c.maxItems) {
          activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
          const oldest = activeNonExiting[0]
          oldest.state = "exit"
          oldest.t = 0 // FIX: Explicitly reset time to trigger the exit animation fully
        }

        const freeIndex = pool.current.findIndex((p) => !p.active)
        if (freeIndex !== -1) {
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          pool.current[freeIndex] = {
            active: true,
            x: e.clientX,
            y: e.clientY,
            rotation: trajectoryAngle, // Lock rotation to the path for correct stretch
            speed: speed, // Store the velocity at the exact moment of spawn
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
      const holdDuration = c.duration * 0.5
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

        // --------------------------------------------------------
        // KINETIC DEFORMATION MATH
        // --------------------------------------------------------
        let baseScale = 1
        let scaleX = 1
        let scaleY = 1
        let opacity = 1
        let blurAmount = 0

        if (item.state === "enter") {
          // Cubic ease-out creates a snappy "rubber band" effect
          const easeOut = 1 - Math.pow(1 - item.t, 3)
          baseScale = easeOut

          // Fast swipes result in heavy stretch. Decays as it enters.
          const stretchFactor = item.speed * 1.5
          scaleX = 1 + stretchFactor * (1 - easeOut)
          scaleY = 1 - Math.min(stretchFactor * 0.15 * (1 - easeOut), 0.6) // Squeeze Y to maintain mass

          blurAmount = item.speed * 2 * (1 - easeOut)
          opacity = easeOut
        } else if (item.state === "hold") {
          baseScale = 1
          scaleX = 1
          scaleY = 1
          opacity = 1
        } else if (item.state === "exit") {
          // Smooth shrink into nothingness
          const easeIn = 1 - item.t
          baseScale = easeIn * easeIn
          scaleX = 1 + item.speed * 0.5 * (1 - baseScale) // Slight re-stretch as it flies away
          scaleY = 1
          opacity = easeIn
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()

        // CSS standard blur supplements the directional stretching
        domNode.style.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : "none"

        domNode.style.transform = `
          translate3d(${item.x}px, ${item.y}px, 0) 
          rotate(${item.rotation}deg) 
          scaleX(${baseScale * scaleX})
          scaleY(${baseScale * scaleY})
        `

        // Reveal the correct image in the DOM without re-rendering React
        const imagesInside =
          domNode.querySelectorAll<HTMLImageElement>("img.js-trail-img")
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
            "absolute top-0 left-0 origin-center overflow-hidden bg-transparent p-0 drop-shadow-2xl will-change-transform",
            itemClassName
          )}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            marginTop: `-${itemSize / 2}px`,
            borderRadius: "22%", // Distorts beautifully when scaleX/Y are applied
            display: "none",
            willChange: "transform, filter, opacity",
          }}
        >
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
      ))}
    </div>
  )
}
