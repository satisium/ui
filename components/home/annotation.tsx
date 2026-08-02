"use client"

import React, { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export interface AnnotationProps {
  targetId: string
  targetAnchor?: { x: number; y: number }
  svgAnchor?: { x: number; y: number }
  size?: number

  // Content (Now accepts custom JSX!)
  title?: React.ReactNode
  children?: React.ReactNode

  // Line Asset
  path: string
  drawFrom?: "start" | "end"

  // Positioning & Tracking
  textPosition?: string
  svgRotation?: string
  trackingLag?: number

  // --- NEW: STYLING & CUSTOMIZATION PROPS ---
  textClassName?: string
  svgClassName?: string
  strokeWidth?: number
  strokeColor?: string

  // --- NEW: TIMING CONTROLS ---
  delay?: number // How long before drawing starts (ms)
  duration?: number // How long the line takes to draw (seconds)
}

export const Annotation: React.FC<AnnotationProps> = ({
  targetId,
  targetAnchor = { x: 0.5, y: 0.5 },
  svgAnchor = { x: 1, y: 1 },
  size = 60,
  title,
  children,
  path,
  drawFrom = "start",
  textPosition = "bottom-full mb-2 left-0",
  svgRotation = "",
  trackingLag = 0.4,

  // Defaults for the new styling props
  textClassName,
  svgClassName,
  strokeWidth = 1.5,
  strokeColor = "currentColor",
  delay = 1000,
  duration = 1.2, // Default 1.2 seconds
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const targetPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })
  const isInitialized = useRef(false)

  const [pathLength, setPathLength] = useState(0)
  const [step, setStep] = useState(0)

  // 1. Hardware-Accelerated Viewport Tracking
  useEffect(() => {
    let rafId: number
    const loop = () => {
      const el = document.getElementById(targetId)
      if (el && containerRef.current) {
        const rect = el.getBoundingClientRect()
        const targetPxX = rect.left + rect.width * targetAnchor.x
        const targetPxY = rect.top + rect.height * targetAnchor.y

        targetPos.current.x = targetPxX - size * svgAnchor.x
        targetPos.current.y = targetPxY - size * svgAnchor.y

        if (!isInitialized.current) {
          currentPos.current.x = targetPos.current.x
          currentPos.current.y = targetPos.current.y
          isInitialized.current = true
        }

        currentPos.current.x +=
          (targetPos.current.x - currentPos.current.x) * trackingLag
        currentPos.current.y +=
          (targetPos.current.y - currentPos.current.y) * trackingLag

        containerRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafId)
  }, [targetId, targetAnchor, svgAnchor, size, trackingLag])

  // 2. Measure & Orchestrate Timeline
  useEffect(() => {
    const checkInit = setInterval(() => {
      if (isInitialized.current && pathRef.current) {
        clearInterval(checkInit)
        const length = pathRef.current.getTotalLength()
        setPathLength(length)

        setTimeout(() => setStep(1), delay)
        // Dynamically calculate when text appears based on `duration`
        setTimeout(() => setStep(2), delay + duration * 1000)
      }
    }, 50)
    return () => clearInterval(checkInit)
  }, [delay, duration, path])

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-10",
        step === 0 && "opacity-0"
      )}
      style={{ width: size, height: size }}
    >
      {/* THE CONTENT/TEXT WRAPPER */}
      <div
        className={cn(
          "pointer-events-auto absolute min-w-[220px] transition-opacity ease-in-out",
          // Default styling (Caveat, etc) can now be overridden by textClassName
          "font-['Caveat',_cursive] text-xl tracking-wide text-foreground",
          step >= 2 ? "opacity-100" : "opacity-0",
          textPosition,
          textClassName
        )}
        // Match the text fade duration to the line draw duration for smooth UX
        style={{ transitionDuration: `${duration * 0.8}s` }}
      >
        {/* Support both `title` string AND custom `children` */}
        {title}
        {children}
      </div>

      {/* THE SVG LINE */}
      <svg
        className={cn(
          "absolute inset-0 h-full w-full text-foreground/40",
          svgRotation,
          svgClassName
        )}
        viewBox="0 0 101 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transformOrigin: `${svgAnchor.x * 100}% ${svgAnchor.y * 100}%`,
        }}
      >
        <path
          ref={pathRef}
          d={path}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength || 1000,
            strokeDashoffset:
              step >= 1
                ? 0
                : drawFrom === "start"
                  ? pathLength || 1000
                  : -(pathLength || 1000),
            transition:
              step >= 1
                ? `stroke-dashoffset ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            opacity: pathLength > 0 ? 1 : 0,
          }}
        />
      </svg>
    </div>
  )
}
