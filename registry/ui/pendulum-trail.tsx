"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface PendulumTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls?: string[]
  /** Distance the pointer must move (in pixels) before spawning a new item. @default 70 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 3000 */
  duration?: number
  /** Maximum items on screen before forcing the oldest to fade out. @default 15 */
  maxItems?: number
  /** The base pixel width of the image cards. @default 110 */
  itemSize?: number
  /** Base horizontal wind angle pushing the cards. @default 10 */
  windAngle?: number
  /** The intensity of the sine-wave flutter applied by the wind. @default 5 */
  windSway?: number
  /** Length of the invisible string. Dictates the speed and arc of the pendulum physics. @default 40 */
  physicsLength?: number
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
  /** Standard Tailwind classes applied to the individual image wrappers. */
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

  // 3x pool prevents active DOM nodes from being hijacked mid-exit animation
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

  // Mutable config allows on-the-fly physics updates without restarting loops
  const config = useRef({
    imageUrls,
    distance,
    duration,
    maxItems,
    itemSize,
    windAngle,
    windSway,
    physicsLength,
  })
  useEffect(() => {
    config.current = {
      imageUrls,
      distance,
      duration,
      maxItems,
      itemSize,
      windAngle,
      windSway,
      physicsLength,
    }
  }, [
    imageUrls,
    distance,
    duration,
    maxItems,
    itemSize,
    windAngle,
    windSway,
    physicsLength,
  ])

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

      // Calculate horizontal pointer velocity to drive initial pendulum swing
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

        // Enforce maxItems threshold
        if (activeNonExiting.length >= c.maxItems) {
          activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
          const oldest = activeNonExiting[0]
          oldest.state = "exit"
          oldest.t = 0 // FIX: Explicitly reset time so the exit animation plays out fully
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

      // Ensure physics length never hits 0 to prevent divide-by-zero Infinity math
      const currentPhysicsLength = Math.max(c.physicsLength, 15)

      // Pendulum frequency: w = sqrt(g / L)
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

        // Calculate dynamic amplitude based on the pointer velocity
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
          c.windAngle +
          Math.sin(timeAlive * 1.5 + item.flutterOffset) * c.windSway

        const finalRotation = pendulumAngle + ambientWind

        // Visual depth illusion
        const depthScale = pendulumDepth / 45
        let visualScale = Math.max(1 + depthScale * 0.08, 0.5)

        let opacity = 1

        // Apply state-based scale and opacity
        if (item.state === "enter") {
          const easeOut = Math.sin((item.t * Math.PI) / 2)
          visualScale *= easeOut
          opacity = item.t
        } else if (item.state === "exit") {
          // FIX: Instead of falling, it gracefully shrinks down to 0 while maintaining its swing
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
            "absolute top-0 left-0 flex flex-col items-center will-change-transform",
            itemClassName
          )}
          style={{
            width: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            transformOrigin: "50% -20px", // Swing purely from the imaginary anchor point above it
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
            <div className="relative h-full w-full overflow-hidden">
              {imageUrls.map((src, imgIndex) => (
                <img
                  key={imgIndex}
                  src={src}
                  alt="trail"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  className="js-trail-img absolute inset-0 h-full w-full overflow-hidden object-cover"
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
