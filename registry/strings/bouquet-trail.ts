export const bouquetTrailDemoString = `
import BouquetTrail from "@/components/ui/bouquet-trail"

const floralElements = [
  // 1. Plumeria
  <svg
    key="plumeria"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(0)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(72)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(144)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(216)"
        opacity="0.9"
      />
      <path
        d="M0,0 C15,-20 20,-45 0,-50 C-20,-45 -15,-20 0,0"
        transform="rotate(288)"
        opacity="0.9"
      />
    </g>
    <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.6)" />
    <circle cx="50" cy="50" r="4" fill="rgba(0,0,0,0.15)" />
  </svg>,

  // 2. Layered Peony
  <svg
    key="peony"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-2xl"
  >
    <g transform="translate(50,50)">
      <circle cx="-15" cy="-15" r="24" opacity="0.6" />
      <circle cx="15" cy="-15" r="24" opacity="0.6" />
      <circle cx="-15" cy="15" r="24" opacity="0.6" />
      <circle cx="15" cy="15" r="24" opacity="0.6" />
      <circle cx="-10" cy="0" r="20" opacity="0.8" />
      <circle cx="10" cy="0" r="20" opacity="0.8" />
      <circle cx="0" cy="-10" r="20" opacity="0.8" />
      <circle cx="0" cy="10" r="20" opacity="0.8" />
      <circle cx="0" cy="0" r="14" opacity="1" />
      <circle cx="0" cy="0" r="6" fill="rgba(255,255,255,0.4)" />
    </g>
  </svg>,

  // 3. The Rose
  <svg
    key="rose"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-2xl"
  >
    <g transform="translate(50,50)">
      <path
        d="M-30,-10 C-30,-30 -10,-40 10,-30 C30,-20 40,0 30,20 C20,40 0,40 -20,20 C-35,5 -30,-10 -30,-10 Z"
        opacity="0.6"
      />
      <path
        d="M-20,15 C-40,5 -30,-20 -10,-25 C10,-30 30,-10 20,10 C15,25 -5,30 -20,15 Z"
        opacity="0.8"
      />
      <path
        d="M10,10 C25,-5 10,-25 -5,-20 C-20,-15 -20,5 -10,15 C0,25 15,20 10,10 Z"
        opacity="0.95"
      />
      <path d="M-5,-5 C-15,5 -5,15 5,10 C15,5 10,-10 0,-5 Z" opacity="1" />
      <path
        d="M 0 0 C -5 -5 -2 -10 2 -5 C 5 0 0 5 0 0 Z"
        fill="rgba(0,0,0,0.3)"
      />
    </g>
  </svg>,

  // 4. The Sunflower (Dynamic petals, hardcoded dark center)
  <svg
    key="sunflower"
    viewBox="0 0 100 100"
    fill="currentColor"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <ellipse
          key={\`out-\${deg}\`}
          cx="0"
          cy="0"
          rx="45"
          ry="8"
          transform={\`rotate(\${deg})\`}
          opacity="0.85"
        />
      ))}
      {[15, 45, 75, 105, 135, 165].map((deg) => (
        <ellipse
          key={\`in-\${deg}\`}
          cx="0"
          cy="0"
          rx="38"
          ry="8"
          transform={\`rotate(\${deg})\`}
          opacity="0.95"
        />
      ))}
      <circle cx="0" cy="0" r="22" fill="#3E2723" />
      <circle
        cx="0"
        cy="0"
        r="18"
        fill="#4E342E"
        stroke="#3E2723"
        strokeWidth="2"
        strokeDasharray="2,2"
      />
    </g>
  </svg>,

  // --- HARDCODED FLOWERS & GREENERY (Ignore random colors) ---

  // 5. The Classic White Daisy
  <svg
    key="whitedaisy"
    viewBox="0 0 100 100"
    className="h-full w-full overflow-visible drop-shadow-xl"
  >
    <g transform="translate(50,50)">
      {[0, 45, 90, 135].map((deg) => (
        <ellipse
          key={\`d1-\${deg}\`}
          cx="0"
          cy="0"
          rx="42"
          ry="12"
          fill="#FFFFFF"
          transform={\`rotate(\${deg})\`}
        />
      ))}
      {[22.5, 67.5, 112.5, 157.5].map((deg) => (
        <ellipse
          key={\`d2-\${deg}\`}
          cx="0"
          cy="0"
          rx="40"
          ry="10"
          fill="#F8F9FA"
          transform={\`rotate(\${deg})\`}
        />
      ))}
      <circle cx="0" cy="0" r="14" fill="#FFD700" />
      <circle cx="0" cy="0" r="10" fill="#FFB300" />
    </g>
  </svg>,

  // 6. Top-Down Grass Clump (Sharp, spiky filler)
  <svg
    key="grass"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-md"
  >
    <g transform="translate(50,50)">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
        <path
          key={\`grass-\${deg}\`}
          d="M-4,0 L0,-45 L4,0 Z"
          fill={i % 2 === 0 ? "#558B2F" : "#7CB342"}
          transform={\`rotate(\${deg})\`}
          opacity="0.9"
        />
      ))}
      <circle cx="0" cy="0" r="8" fill="#33691E" opacity="0.8" />
    </g>
  </svg>,

  // 7. Double Leaf
  <svg
    key="leaf1"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-md"
  >
    <g transform="translate(50,80)">
      <path
        d="M0,0 Q-30,-20 0,-60 Q10,-30 0,0"
        fill="#7BAA5E"
        transform="rotate(-25)"
        opacity="0.9"
      />
      <path
        d="M0,0 Q-30,-20 0,-60 Q10,-30 0,0"
        fill="#90C371"
        transform="rotate(25)"
        opacity="0.9"
      />
    </g>
  </svg>,

  // 8. Broad Pointed Leaf
  <svg
    key="leaf2"
    viewBox="0 0 100 100"
    fill="none"
    className="h-full w-full overflow-visible drop-shadow-lg"
  >
    <path
      d="M50 95 Q 20 50 50 5 Q 80 50 50 95 Z"
      fill="#6A994E"
      opacity="0.85"
    />
    <path d="M50 95 L 50 5" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
  </svg>,
]

const warmVibrantColors = [
  "#FF5E7E", // Vibrant Pink-Red
  "#FF9B71", // Warm Orange
  "#FFD166", // Bright Yellow
  "#F36CA3", // Hot Pink
  "#FFB042", // Golden Orange
  "#E05263", // Coral Red
  "#FFA3A5", // Soft Warm Pink
]

export default function BouquetTrailDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none z-10 flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Floral Bouquet.
        </h1>
      </div>

      <BouquetTrail
        elements={floralElements}
        colors={warmVibrantColors}
        itemSize={40}
        distance={10} 
        scatterRadius={20} 
        maxItems={50} 
        duration={3000} 
        scaleRange={[0.6, 1.4]}
        rotationRange={360}
        enableBreathing={true}
      />
    </main>
  )
}`

export const bouquetTrailString = `"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const popEasing = (t: number) => {
  const c1 = 1.70158
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export interface BouquetTrailProps {
  elements?: React.ReactNode[]
  colors?: string[]
  itemSize?: number
  scatterRadius?: number
  distance?: number
  maxItems?: number
  duration?: number
  scaleRange?: [number, number]
  rotationRange?: number
  enableBreathing?: boolean
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

    window.addEventListener("pointermove", handleMouseMove as any)
    return () => window.removeEventListener("pointermove", handleMouseMove as any)
  }, [])

  useEffect(() => {
    const animate = () => {
      const s = state.current
      const c = config.current
      const currentTime = Date.now()
      
      const delta = Math.min(currentTime - s.lastFrameTime, 32)
      s.lastFrameTime = currentTime

      if (s.hasStarted) {
        s.cursorPos.x += (s.targetPos.x - s.cursorPos.x) * 0.3
        s.cursorPos.y += (s.targetPos.y - s.cursorPos.y) * 0.3

        const moveDx = s.cursorPos.x - s.prevCursorPos.x
        const moveDy = s.cursorPos.y - s.prevCursorPos.y
        const moveDist = Math.hypot(moveDx, moveDy)

        if (moveDist > 0.1) {
          s.distanceAccumulator += moveDist
          s.lastMoveTime = currentTime

          while (s.distanceAccumulator >= c.distance) {
            s.distanceAccumulator -= c.distance
            s.spawnCount += 1

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
                sizeMultiplier: minScale + Math.random() * (maxScale - minScale),
                breathingOffset: Math.random() * Math.PI * 2,
                zIndex: s.spawnCount, 
                t: 0,
                state: "enter",
                holdTime: 0,
                spawnTime: currentTime,
              }
            }
          }
        } else {
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

      const enterDuration = c.duration * 0.15
      const holdDuration = c.duration * 0.55
      const exitDuration = c.duration * 0.3

      for (let i = 0; i < DOM_POOL_SIZE; i++) {
        const item = pool.current[i]
        const domNode = domRefs.current[i]

        if (!domNode) continue

        if (!item.active) {
          domNode.style.opacity = "0"
          domNode.style.transform = \`translate3d(-10000px, -10000px, 0)\`
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
            domNode.style.opacity = "0"
            domNode.style.transform = \`translate3d(-10000px, -10000px, 0)\`
            continue
          }
        }

        let scale = 0

        if (item.state === "enter") {
          scale = Math.max(0, popEasing(item.t))
        } else if (item.state === "hold") {
          const breathe = c.enableBreathing 
            ? Math.sin((currentTime / 1000) * 3 + item.breathingOffset) * 0.05
            : 0
          scale = 1 + breathe
        } else if (item.state === "exit") {
          scale = Math.max(0, item.t * item.t)
        }

        const finalScale = scale * item.sizeMultiplier

        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = "1"
        domNode.style.transform = \`translate3d(\${item.x}px, \${item.y}px, 0) rotate(\${item.rotation}deg) scale(\${finalScale})\`

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
            width: \`\${itemSize}px\`,
            height: \`\${itemSize}px\`,
            marginLeft: \`-\${itemSize / 2}px\`,
            marginTop: \`-\${itemSize / 2}px\`,
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
}`

export const bouquetTrailFile = {
  "bouquet-trail.tsx": {
    code: bouquetTrailString,
    language: "tsx",
  },
}
