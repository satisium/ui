"use client"

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  MotionValue,
} from "motion/react"
import { useEffect, useRef } from "react"

// --- RESTORED PROPS ---
interface RotaryCarouselProps {
  /**
   * How fast the wheel spins relative to your mouse movement during the drag.
   * 1 = 1:1 Physical mapping
   * 2 = Spins twice as fast as your hand (light feel)
   * 0.5 = Spins half as fast as your hand (heavy feel)
   */
  dragSensitivity?: number

  /**
   * How far the wheel coasts after you let go.
   * 1 = Normal friction
   * 2 = Very slick bearings (coasts longer)
   * 0.5 = Heavy friction (stops quicker)
   */
  momentumMultiplier?: number
}

export default function RotaryCarousel({
  dragSensitivity = 0.1,
  momentumMultiplier = 1,
}: RotaryCarouselProps) {
  const rotation = useMotionValue(0)

  const wheelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const animationRef = useRef<any>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!wheelRef.current) return
    if (animationRef.current) animationRef.current.stop()

    isDragging.current = true
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current || !wheelRef.current) return

      const rect = wheelRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rx = lastMousePos.current.x - centerX
      const ry = lastMousePos.current.y - centerY

      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y

      const radiusSquared = rx * rx + ry * ry
      if (radiusSquared < 2500) {
        lastMousePos.current = { x: e.clientX, y: e.clientY }
        return
      }

      // True physical torque (Cross Product)
      const torque = rx * dy - ry * dx
      let deltaAngle = (torque / radiusSquared) * (180 / Math.PI)

      // --- RESTORED: DRAG SENSITIVITY ---
      deltaAngle *= dragSensitivity

      rotation.set(rotation.get() + deltaAngle)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handlePointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false

      const releaseVelocity = rotation.getVelocity()

      animationRef.current = animate(
        rotation,
        rotation.get() + releaseVelocity,
        {
          type: "inertia",
          velocity: releaseVelocity,

          // --- RESTORED: MOMENTUM MULTIPLIER ---
          // Base momentum of 0.8 multiplied by your custom coasting prop
          power: 1 * momentumMultiplier,
          timeConstant: 1000,
          bounceStiffness: 0,
          bounceDamping: 0,
          restDelta: 0.001,
        }
      )
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [rotation, dragSensitivity, momentumMultiplier])

  const items = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&q=80",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    "https://images.unsplash.com/photo-1772732414979-f2f48b908fbe?q=80&w=1632&auto=format&fit=crop",
  ]
  const radius = 300

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* THE ISOLATED HITBOX */}
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        className="absolute z-50 h-[600px] w-[600px] cursor-grab touch-none rounded-full active:cursor-grabbing"
      />

      <motion.div style={{ rotate: rotation }} className="relative h-0 w-0">
        {items.map((img, i) => (
          <WheelItem
            key={i}
            index={i}
            total={items.length}
            radius={radius}
            wheelRotation={rotation}
            img={img}
          />
        ))}
      </motion.div>
    </div>
  )
}

function WheelItem({
  index,
  total,
  radius,
  wheelRotation,
  img,
}: {
  index: number
  total: number
  radius: number
  wheelRotation: MotionValue<number>
  img: string
}) {
  const baseAngle = (360 / total) * index
  const counterRotation = useTransform(wheelRotation, (r) => -r - baseAngle)

  return (
    <div
      className="pointer-events-none absolute top-1/2 left-1/2"
      style={{ transform: `translate(-50%, -50%) rotate(${baseAngle}deg)` }}
    >
      <div style={{ transform: `translateY(${-radius}px)` }}>
        <motion.div
          style={{ rotate: counterRotation }}
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[16px] border border-border bg-foreground/30 p-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-md"
        >
          <img
            src={img}
            alt={`Wheel item ${index}`}
            className="pointer-events-none h-full w-full rounded-[12px] object-cover select-none"
          />
        </motion.div>
      </div>
    </div>
  )
}
