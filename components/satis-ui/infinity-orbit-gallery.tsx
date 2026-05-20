"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  useScroll,
  useVelocity,
  useSpring,
} from "motion/react"
import { cn } from "@/lib/utils"

// Pre-calculated, perfectly symmetric SVG paths
const PATH_PRESETS = {
  circle: "M 500, 500 m -400, 0 a 400,400 0 1,0 800,0 a 400,400 0 1,0 -800,0 Z",
  oval: "M 500, 500 m -450, 0 a 450,250 0 1,0 900,0 a 450,250 0 1,0 -900,0 Z",
  infinity:
    "M500,500 C500,100 100,100 100,500 C100,900 500,900 500,500 C500,100 900,100 900,500 C900,900 500,900 500,500 Z",
}

type PathType = keyof typeof PATH_PRESETS | (string & {})

/** Math utility to properly wrap negative numbers for infinite looping */
function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

interface OrbitGalleryProps {
  items: React.ReactNode[]
  path?: PathType
  duration?: number
  tilt?: number
  pauseOnHover?: boolean
  hideTrack?: boolean
  fadeEdges?: boolean
  className?: string
}

export function OrbitGallery({
  items,
  path = "circle",
  duration = 30, // Default 30s for a very premium, slow base speed
  tilt = 0,
  pauseOnHover = true,
  hideTrack = false,
  fadeEdges = true,
  className,
}: OrbitGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const svgPath = PATH_PRESETS[path as keyof typeof PATH_PRESETS] || path

  // 1. Responsive Scaling (Virtual Canvas)
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect
        setScale(width / 1000)
      }
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 2. Physics & State Engines
  const baseProgress = useMotionValue(0)

  // Hover Physics (Soft Spring Deceleration)
  const isHovered = useMotionValue(0)
  const smoothHover = useSpring(isHovered, {
    damping: 20,
    stiffness: 100,
    mass: 0.5,
  })
  // Maps 0 (unhovered) to 1 (hovered), which we flip to a speed multiplier (1 to 0)
  const hoverFactor = useTransform(smoothHover, [0, 1], [1, 0])

  // Scroll Velocity Physics (Apple-tier Momentum)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  // Map scroll speed (-1000 to 1000px/s) to a multiplier (-4x to +4x speed)
  const velocityFactor = useTransform(
    smoothVelocity,
    [-1000, 0, 1000],
    [-4, 0, 4],
    { clamp: false }
  )

  // 3. The Master Time Loop
  useAnimationFrame((t, delta) => {
    // Cap delta to prevent massive jumps if tab is inactive
    const safeDelta = Math.min(delta, 50)
    const deltaSeconds = safeDelta / 1000

    // Base speed: percent of path completed per second
    const baseSpeed = 100 / duration

    // Current speed = base * hoverFactor + scroll momentum
    let speed = baseSpeed * hoverFactor.get()
    speed += baseSpeed * velocityFactor.get()

    baseProgress.set(baseProgress.get() + speed * deltaSeconds)
  })

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex aspect-square w-full items-center justify-center",
        fadeEdges &&
          "[mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)]",
        className
      )}
      onMouseEnter={() => pauseOnHover && isHovered.set(1)}
      onMouseLeave={() => pauseOnHover && isHovered.set(0)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 flex items-center justify-center"
        style={{
          width: "1000px",
          height: "1000px",
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) scale(${scale}) rotateX(${tilt}deg)`,
          willChange: "transform",
        }}
      >
        {!hideTrack && (
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 h-full w-full text-foreground/5"
          >
            {/* Premium Track styling: Soft gradient instead of dashed lines */}
            <defs>
              <linearGradient
                id="track-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={svgPath}
              fill="none"
              stroke="url(#track-gradient)"
              strokeWidth="1"
            />
          </svg>
        )}

        {items.map((item, index) => {
          const startOffset = (index / items.length) * 100
          return (
            <OrbitItem
              key={index}
              item={item}
              svgPath={svgPath}
              baseProgress={baseProgress}
              startOffset={startOffset}
              tilt={tilt}
            />
          )
        })}
      </div>
    </div>
  )
}

// Sub-component for strict hardware-accelerated interpolation
function OrbitItem({
  item,
  svgPath,
  baseProgress,
  startOffset,
  tilt,
}: {
  item: React.ReactNode
  svgPath: string
  baseProgress: any
  startOffset: number
  tilt: number
}) {
  // Translate the infinitely growing/shrinking base progress into a precise 0-100% loop
  const offsetDistance = useTransform(baseProgress, (p: number) => {
    // toFixed(4) is critical to prevent sub-pixel GPU jitter
    return `${wrap(0, 100, p + startOffset).toFixed(4)}%`
  })

  return (
    <motion.div
      className="pointer-events-auto absolute top-0 left-0"
      style={{
        // @ts-ignore
        offsetPath: `path('${svgPath}')`,
        offsetDistance,
        offsetRotate: "0deg",
        transformStyle: "preserve-3d",
        willChange: "offset-distance, transform",
      }}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{
          // Counter-rotate the item perfectly so it stands upright
          transform: `rotateX(${-tilt}deg)`,
        }}
      >
        {item}
      </div>
    </motion.div>
  )
}
