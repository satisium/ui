"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface KaleidoscopeTrailProps {
  /** Array of image URLs to randomly spawn. */
  imageUrls?: string[]
  /** Distance the pointer must move (in pixels) before spawning a new geometric group. @default 40 */
  distance?: number
  /** The total lifespan of a spawned item in milliseconds. @default 2000 */
  duration?: number
  /** Number of drop groups (a group contains 'mirrors' clones) before forcing the oldest to exit. @default 12 */
  maxGroups?: number
  /** How many mirrors/reflections to create around the center (e.g., 6 = Hexagon). @default 6 */
  mirrors?: number
  /** The base pixel size of the image cards. @default 90 */
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
  baseRotation: number
  imageIndex: number
  zIndex: number

  // State Machine Variables
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

  // Pool must be large enough to handle symmetric clones + exit transition overlap
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

  // Mutable config ref avoids restarting the RAF loop on prop changes
  const config = useRef({
    imageUrls,
    distance,
    maxGroups,
    duration,
    itemSize,
    mirrors,
  })
  useEffect(() => {
    config.current = {
      imageUrls,
      distance,
      maxGroups,
      duration,
      itemSize,
      mirrors,
    }
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
        // Find how many cards are currently active
        const activeCards = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        // If we exceed our drop limit, force the oldest group of clones to exit
        if (activeCards.length >= c.maxGroups * c.mirrors) {
          activeCards.sort((a, b) => a.spawnTime - b.spawnTime)
          // Kill exactly one 'mirrors' group
          for (let i = 0; i < c.mirrors; i++) {
            if (activeCards[i]) activeCards[i].state = "exit"
          }
        }

        // Center of the screen acts as the mirror axis
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2

        // Pointer offset from center
        const mx = e.clientX - cx
        const my = e.clientY - cy

        // Convert to polar coordinates
        const radius = Math.hypot(mx, my)
        const baseAngle = Math.atan2(my, mx)

        s.lastDropPos = { x: e.clientX, y: e.clientY }
        s.spawnCount += 1

        const spawnTime = Date.now()
        // Same image for the entire symmetrical group
        const imageIndex = s.spawnCount % c.imageUrls.length

        // Spawn `mirrors` amount of clones in a perfect radial distribution
        for (let i = 0; i < c.mirrors; i++) {
          const freeIndex = pool.current.findIndex((p) => !p.active)
          if (freeIndex !== -1) {
            const angleOffset = (i * 2 * Math.PI) / c.mirrors
            const finalAngle = baseAngle + angleOffset

            // Convert polar back to cartesian
            const symX = cx + radius * Math.cos(finalAngle)
            const symY = cy + radius * Math.sin(finalAngle)

            // Convert radians to degrees for CSS rotation
            // Offset by 90deg to orient the top of the image radially outwards
            const rotationDeg = finalAngle * (180 / Math.PI) + 90

            pool.current[freeIndex] = {
              active: true,
              x: symX,
              y: symY,
              baseRotation: rotationDeg,
              imageIndex,
              zIndex: s.spawnCount, // They share the same Z-index to layer beautifully
              t: 0,
              state: "enter",
              holdTime: 0,
              spawnTime,
            }
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
        let currentRotation = item.baseRotation

        if (item.state === "enter") {
          // Snappy scaling enter
          const easeOut = 1 - Math.pow(1 - item.t, 3)
          scale = easeOut
          opacity = easeOut
        } else if (item.state === "hold") {
          const p = item.holdTime / holdDuration
          // Subtle, continuous breathing scale
          scale = 1 + Math.sin(p * Math.PI) * 0.1
          // Slow, mesmerizing spin applied uniformly
          currentRotation = item.baseRotation + p * 45
          opacity = 1
        } else if (item.state === "exit") {
          // Shrink to zero like a collapsing star
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
            // Rounder corners make the geometric formations look smoother
            borderRadius: "35%",
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
              className="absolute inset-0 h-full w-full rounded-[35%] object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
