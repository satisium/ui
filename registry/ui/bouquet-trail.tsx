"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// A bouncy, spring-like easing function for the "pop-in" entrance animation
const popEasing = (t: number) => {
  const c1 = 1.70158
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export interface BouquetTrailProps {
  /** Array of React Nodes (SVGs, Icons, Images) used as the trail particles. */
  elements?: React.ReactNode[]
  /** Array of hex colors randomly applied to the elements. */
  colors?: string[]
  /** The base width and height of each item in pixels. @default 40 */
  itemSize?: number
  /** The maximum distance an item can spawn from the cursor's exact path. @default 40 */
  scatterRadius?: number
  /** The distance the mouse must move in pixels before spawning the next item. @default 12 */
  distance?: number
  /** Maximum number of active items on screen before forcing older ones to exit. @default 150 */
  maxItems?: number
  /** The total lifespan of an item from enter to exit in milliseconds. @default 2500 */
  duration?: number
  /** The random scale range applied to items upon spawn. Format: [min, max]. @default [0.5, 1.5] */
  scaleRange?: [number, number]
  /** The maximum random rotation applied to items in degrees. @default 360 */
  rotationRange?: number
  /** Toggles the gentle sine-wave pulsing effect while items are holding on screen. @default true */
  enableBreathing?: boolean
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
}

interface ParticleData {
  active: boolean
  x: number
  y: number
  color: string
  type: number
  rotation: number
  sizeMultiplier: number
  breathingOffset: number
  zIndex: number

  // Internal State Machine
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function BouquetTrail({
  elements = [],
  colors = ["#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#c7ceea"],
  itemSize = 40,
  scatterRadius = 40,
  distance = 12,
  maxItems = 150,
  duration = 2500,
  scaleRange = [0.5, 1.5],
  rotationRange = 360,
  enableBreathing = true,
  className,
}: BouquetTrailProps) {
  const reqRef = useRef<number | null>(null)

  // --------------------------------------------------------
  // HARDWARE OPTIMIZATION: The DOM Object Pool
  // We allocate a fixed array of DOM nodes and recycle them.
  // Pool size is 3x the maxItems to ensure exiting items have
  // enough time to shrink to 0 before their DOM node is hijacked.
  // --------------------------------------------------------
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<ParticleData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      color: "",
      type: 0,
      rotation: 0,
      sizeMultiplier: 1,
      breathingOffset: 0,
      zIndex: 0,
      t: 0,
      state: "enter",
      holdTime: 0,
      spawnTime: 0,
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef({
    distanceAccumulator: 0,
    spawnCount: 0,
    cursorPos: { x: -1000, y: -1000 },
    prevCursorPos: { x: -1000, y: -1000 },
    targetPos: { x: -1000, y: -1000 },
    hasStarted: false,
    lastFrameTime: 0,
    lastMoveTime: 0,
  })

  // Keep a mutable ref of configuration to avoid restarting the RAF loop when props change
  const config = useRef({
    elements,
    colors,
    itemSize,
    scatterRadius,
    distance,
    duration,
    maxItems,
    scaleRange,
    rotationRange,
    enableBreathing,
  })

  useEffect(() => {
    config.current = {
      elements,
      colors,
      itemSize,
      scatterRadius,
      distance,
      duration,
      maxItems,
      scaleRange,
      rotationRange,
      enableBreathing,
    }
  }, [
    elements,
    colors,
    itemSize,
    scatterRadius,
    distance,
    duration,
    maxItems,
    scaleRange,
    rotationRange,
    enableBreathing,
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      state.current.targetPos = { x: e.clientX, y: e.clientY }
      if (!state.current.hasStarted) {
        state.current.cursorPos = { x: e.clientX, y: e.clientY }
        state.current.prevCursorPos = { x: e.clientX, y: e.clientY }
        state.current.hasStarted = true
        state.current.lastFrameTime = Date.now()
      }
    }

    // Unified pointer events to handle both mouse and touch flawlessly
    window.addEventListener("pointermove", handleMouseMove as any)
    return () =>
      window.removeEventListener("pointermove", handleMouseMove as any)
  }, [])

  useEffect(() => {
    const animate = () => {
      const s = state.current
      const c = config.current
      const currentTime = Date.now()

      // Cap delta at 32ms (~30fps) to prevent massive mathematical jumps on lag spikes
      const delta = Math.min(currentTime - s.lastFrameTime, 32)
      s.lastFrameTime = currentTime

      if (s.hasStarted) {
        // Smoothly trail the actual pointer coordinates for fluid strokes
        s.cursorPos.x += (s.targetPos.x - s.cursorPos.x) * 0.3
        s.cursorPos.y += (s.targetPos.y - s.cursorPos.y) * 0.3

        const moveDx = s.cursorPos.x - s.prevCursorPos.x
        const moveDy = s.cursorPos.y - s.prevCursorPos.y
        const moveDist = Math.hypot(moveDx, moveDy)

        if (moveDist > 0.1) {
          s.distanceAccumulator += moveDist
          s.lastMoveTime = currentTime

          // --------------------------------------------------------
          // DISTANCE-BASED SPAWNING
          // Spawns items uniformly based on pixels moved, regardless of mouse speed.
          // --------------------------------------------------------
          while (s.distanceAccumulator >= c.distance) {
            s.distanceAccumulator -= c.distance
            s.spawnCount += 1

            const activeNonExiting = pool.current.filter(
              (p) => p.active && p.state !== "exit"
            )

            // Over-limit Protection: Force the oldest particle into an exit state
            if (activeNonExiting.length >= c.maxItems) {
              activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
              const oldest = activeNonExiting[0]
              oldest.state = "exit"
            }

            // Find an inactive slot in the DOM pool
            const freeIndex = pool.current.findIndex((p) => !p.active)

            if (freeIndex !== -1) {
              const fraction = 1 - s.distanceAccumulator / moveDist
              const interpolatedX = s.prevCursorPos.x + moveDx * fraction
              const interpolatedY = s.prevCursorPos.y + moveDy * fraction

              const angle = Math.random() * Math.PI * 2
              const radius = Math.random() * c.scatterRadius
              const spawnX = interpolatedX + Math.cos(angle) * radius
              const spawnY = interpolatedY + Math.sin(angle) * radius

              const [minScale, maxScale] = c.scaleRange

              pool.current[freeIndex] = {
                active: true,
                x: spawnX,
                y: spawnY,
                color: c.colors[Math.floor(Math.random() * c.colors.length)],
                type: c.elements.length
                  ? Math.floor(Math.random() * c.elements.length)
                  : 0,
                rotation: Math.random() * c.rotationRange,
                sizeMultiplier:
                  minScale + Math.random() * (maxScale - minScale),
                breathingOffset: Math.random() * Math.PI * 2,
                zIndex: s.spawnCount, // Sequential z-index ensures newer items overlap older ones
                t: 0,
                state: "enter",
                holdTime: 0,
                spawnTime: currentTime,
              }
            }
          }
        } else {
          // Accelerate aging when the mouse is idle to clear the screen
          if (currentTime - s.lastMoveTime > 50) {
            for (let i = 0; i < DOM_POOL_SIZE; i++) {
              const item = pool.current[i]
              if (item.active && item.state !== "exit") {
                item.holdTime += delta * 2
              }
            }
          }
        }

        s.prevCursorPos.x = s.cursorPos.x
        s.prevCursorPos.y = s.cursorPos.y
      }

      // --------------------------------------------------------
      // THE BI-DIRECTIONAL TIME SCRUBBER
      // Computes life-cycles for every active particle independently.
      // --------------------------------------------------------
      const enterDuration = c.duration * 0.15
      const holdDuration = c.duration * 0.55
      const exitDuration = c.duration * 0.3

      for (let i = 0; i < DOM_POOL_SIZE; i++) {
        const item = pool.current[i]
        const domNode = domRefs.current[i]

        if (!domNode) continue

        // Hide inactive pool members safely offscreen
        if (!item.active) {
          domNode.style.opacity = "0"
          domNode.style.transform = `translate3d(-10000px, -10000px, 0)`
          continue
        }

        // Advance the state machine
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
            domNode.style.opacity = "0"
            domNode.style.transform = `translate3d(-10000px, -10000px, 0)`
            continue
          }
        }

        // Resolve Visual Scale based on current state
        let scale = 0

        if (item.state === "enter") {
          scale = Math.max(0, popEasing(item.t))
        } else if (item.state === "hold") {
          const breathe = c.enableBreathing
            ? Math.sin((currentTime / 1000) * 3 + item.breathingOffset) * 0.05
            : 0
          scale = 1 + breathe
        } else if (item.state === "exit") {
          // Quadratic ease-out shrink
          scale = Math.max(0, item.t * item.t)
        }

        const finalScale = scale * item.sizeMultiplier

        // Apply physical transformations
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = "1"
        domNode.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${item.rotation}deg) scale(${finalScale})`

        // Display correct element from the shapes array
        if (c.elements.length > 0) {
          const shapesInside =
            domNode.querySelectorAll<HTMLElement>(".js-trail-item")
          shapesInside.forEach((shapeEl, idx) => {
            if (idx === item.type) {
              shapeEl.style.color = item.color
              shapeEl.style.opacity = "1"
            } else {
              shapeEl.style.opacity = "0"
            }
          })
        }
      }

      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [])

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
            "absolute top-0 left-0 flex origin-center items-center justify-center will-change-transform"
          )}
          style={{
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            marginTop: `-${itemSize / 2}px`,
            opacity: 0,
            transform: "translate3d(-10000px, -10000px, 0)",
          }}
        >
          {elements.map((element, elementIndex) => (
            <div
              key={elementIndex}
              className="js-trail-item absolute inset-0 flex items-center justify-center text-current drop-shadow-md transition-none"
              style={{ opacity: 0 }}
            >
              {element}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
