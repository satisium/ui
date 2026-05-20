"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import {
  motion,
  useMotionValue,
  animate,
  useTransform,
  AnimatePresence,
} from "motion/react"
import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

/** Math utility to properly wrap positive/negative values for infinite arrays */
function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

interface Testimonial {
  id: string | number
  image: string
  name: string
  role: string
  quote: string
}

interface TestimonialDialProps {
  items: Testimonial[]
  radius?: number
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export function TestimonialDial({
  items,
  radius = 800,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}: TestimonialDialProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  // ------------------------------------------------------------------
  // STATE & REFS
  // ------------------------------------------------------------------
  // Absolute Index tracks infinite rotations (..., -2, -1, 0, 1, 2, ...).
  // This solves the "winding/unwinding" bug when changing directions.
  const [absoluteIndex, setAbsoluteIndex] = useState(0)

  // Direction (1 for right/next, -1 for left/prev) used by AnimatePresence
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const rotation = useMotionValue(0)
  const notchSize = 360 / items.length
  const animControls = useRef<any>(null)

  // Gesture Tracking
  const isDragging = useRef(false)
  const lastAngle = useRef(0)
  const lastTime = useRef(0)
  const angularVelocity = useRef(0) // degrees per millisecond
  const dragStartPos = useRef({ x: 0, y: 0 })

  // Display Index is the mapped array index (0 to items.length - 1)
  const displayIndex = wrap(0, items.length, absoluteIndex)

  // ------------------------------------------------------------------
  // CORE ENGINE: Snap to Index
  // ------------------------------------------------------------------
  const snapToIndex = useCallback(
    (
      targetAbsoluteIndex: number,
      velocityObj: { velocity: number } = { velocity: 0 }
    ) => {
      // 1. Calculate direction for AnimatePresence
      const diff = targetAbsoluteIndex - absoluteIndex
      setDirection(diff > 0 ? 1 : -1)

      // 2. Set State
      setAbsoluteIndex(targetAbsoluteIndex)

      // 3. Fire Physics Spring
      const targetRot = -targetAbsoluteIndex * notchSize
      animControls.current?.stop()
      animControls.current = animate(rotation, targetRot, {
        type: "spring",
        stiffness: 250,
        damping: 30,
        mass: 1,
        velocity: velocityObj.velocity, // Inherit drag momentum!
      })
    },
    [absoluteIndex, notchSize, rotation]
  )

  // ------------------------------------------------------------------
  // FIX 1 & 3: Gesture Momentum Engine & Native Event Capture
  // ------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return

    // Capture pointer so dragging outside the window doesn't break state
    e.currentTarget.setPointerCapture(e.pointerId)

    animControls.current?.stop()
    isDragging.current = true
    dragStartPos.current = { x: e.clientX, y: e.clientY }

    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    lastAngle.current =
      Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
    lastTime.current = performance.now()
    angularVelocity.current = 0
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !wheelRef.current) return

    const rect = wheelRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const currentAngle =
      Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
    const now = performance.now()
    const dt = now - lastTime.current

    const delta = wrap(-180, 180, currentAngle - lastAngle.current)

    if (dt > 0) {
      angularVelocity.current = delta / dt // Calculate true velocity (deg/ms)
    }

    rotation.set(rotation.get() + delta)
    lastAngle.current = currentAngle
    lastTime.current = now
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)

    // If user holds still before releasing, kill the momentum
    if (performance.now() - lastTime.current > 100) {
      angularVelocity.current = 0
    }

    // Did they just click instead of drag? Let the Avatar onClick handle it.
    const distance = Math.hypot(
      e.clientX - dragStartPos.current.x,
      e.clientY - dragStartPos.current.y
    )
    if (distance < 5) return

    // --- VELOCITY PROJECTION (The Momentum Math) ---
    const currentRot = rotation.get()
    // Multiply velocity by a friction constant to project how far it coasts
    const projectedRot = currentRot + angularVelocity.current * 250

    // Find the nearest notch to that projected stopping point
    const targetAbsoluteIndex = Math.round(-projectedRot / notchSize)

    snapToIndex(targetAbsoluteIndex, {
      velocity: angularVelocity.current * 1000,
    }) // convert to deg/sec for Framer Spring
  }

  // ------------------------------------------------------------------
  // FIX 2: Auto-Play Lifecycle
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!autoPlay || isHovered) return

    const timer = setInterval(() => {
      if (isDragging.current) return
      snapToIndex(absoluteIndex + 1)
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [autoPlay, autoPlayInterval, isHovered, absoluteIndex, snapToIndex])

  // ------------------------------------------------------------------
  // FIX 6: Accessibility (Keyboard Navigation)
  // ------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") snapToIndex(absoluteIndex + 1)
    if (e.key === "ArrowLeft") snapToIndex(absoluteIndex - 1)
  }

  return (
    <div
      ref={containerRef}
      // Fix 3 & 6: select-none, touch-none prevent browser conflicts. tabIndex enables A11y.
      className={cn(
        "relative flex h-[600px] w-full touch-none flex-col items-center overflow-hidden bg-background select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-[700px]",
        className
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 
        The Testimonial Layer 
        Fix 5: custom={direction} drives the AnimatePresence variants mathematically
      */}
      <div className="pointer-events-none relative z-20 mt-12 flex h-[250px] w-full max-w-2xl items-center justify-center px-6 md:mt-24">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={absoluteIndex} // Fix 4: absoluteIndex guarantees unique keys even when rapidly spinning
            custom={direction}
            variants={{
              enter: (dir) => ({
                opacity: 0,
                x: dir * 40,
                filter: "blur(8px)",
              }),
              center: { opacity: 1, x: 0, filter: "blur(0px)" },
              exit: (dir) => ({
                opacity: 0,
                x: dir * -40,
                filter: "blur(8px)",
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute flex flex-col items-center text-center"
          >
            <div className="relative overflow-hidden rounded-3xl border border-foreground/5 bg-background/40 p-6 shadow-2xl backdrop-blur-xl md:p-8">
              <div className="absolute top-0 left-1/2 h-1 w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <Quote className="mx-auto mb-4 h-8 w-8 text-primary/40" />
              <p className="text-xl leading-relaxed font-medium text-foreground md:text-2xl">
                "{items[displayIndex].quote}"
              </p>
              <div className="mt-6">
                <h4 className="text-lg font-semibold tracking-tight">
                  {items[displayIndex].name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {items[displayIndex].role}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The Grand Arch / Invisible Wheel */}
      <div className="pointer-events-none absolute top-[300px] left-1/2 z-10 -translate-x-1/2 md:top-[400px]">
        <motion.div
          ref={wheelRef}
          className="relative rounded-full border border-foreground/5 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"
          style={{ width: radius * 2, height: radius * 2, rotate: rotation }}
        >
          {items.map((item, i) => (
            <AvatarNode
              key={item.id}
              item={item}
              index={i}
              notchSize={notchSize}
              rotation={rotation}
              radius={radius}
              onClick={() => {
                // Shortest path calculation relative to current absolute index
                const diff = i - displayIndex
                let steps = diff
                // Optimize shortest path mathematically (e.g. going 4 -> 0 is +1 step, not -4)
                if (diff > items.length / 2) steps -= items.length
                if (diff < -items.length / 2) steps += items.length

                snapToIndex(absoluteIndex + steps)
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------
// The Proximity Avatar Node (GPU Accelerated)
// ------------------------------------------------------------------
function AvatarNode({
  item,
  index,
  notchSize,
  rotation,
  radius,
  onClick,
}: any) {
  const itemAngle = index * notchSize

  const distance = useTransform(rotation, (r: number) =>
    Math.abs(wrap(-180, 180, r + itemAngle))
  )

  const scale = useTransform(distance, [0, notchSize * 1.5], [1.2, 0.8], {
    clamp: true,
  })
  const opacity = useTransform(distance, [0, notchSize * 1.5], [1, 0.5], {
    clamp: true,
  })
  const filterString = useTransform(distance, (d: number) => {
    const clamped = Math.min(d / (notchSize * 1.5), 1)
    return `blur(${clamped * 3}px) grayscale(${clamped * 100}%)`
  })

  const counterRotate = useTransform(rotation, (r: number) => -(r + itemAngle))

  return (
    <div
      className="absolute top-1/2 left-1/2"
      style={{
        transform: `translate(-50%, -50%) rotate(${itemAngle}deg) translateY(-${radius}px)`,
      }}
    >
      <motion.div
        style={{ rotate: counterRotate, scale, filter: filterString, opacity }}
        className="pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-[1.25] active:cursor-grabbing"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <div className="h-16 w-16 overflow-hidden rounded-full border-[3px] border-background shadow-xl md:h-20 md:w-20">
          {/* Fix 3: draggable={false} prevents Ghost Image drag bug */}
          <img
            src={item.image}
            alt={item.name}
            draggable={false}
            className="pointer-events-none h-full w-full object-cover select-none"
          />
        </div>
      </motion.div>
    </div>
  )
}
