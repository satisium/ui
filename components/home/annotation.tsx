"use client"

import React, { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export interface AnnotationProps {
  targetId: string
  targetAnchor?: { x: number; y: number }
  svgAnchor?: { x: number; y: number }
  size?: number

  // Content
  title?: React.ReactNode
  children?: React.ReactNode

  // Line Asset
  path: string
  drawFrom?: "start" | "end"

  // Positioning
  textPosition?: string
  svgRotation?: string

  // --- STYLING & CUSTOMIZATION PROPS ---
  textClassName?: string
  svgClassName?: string
  strokeWidth?: number
  strokeColor?: string

  // --- TIMING CONTROLS ---
  delay?: number
  duration?: number
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

  // Defaults for the styling props
  textClassName,
  svgClassName,
  strokeWidth = 1.5,
  strokeColor = "currentColor",
  delay = 1000,
  duration = 1.2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const isInitialized = useRef(false)

  const [pathLength, setPathLength] = useState(0)
  const [step, setStep] = useState(0)

  // 1. Hardware-Accelerated Viewport Tracking (NATIVE SCROLL, ZERO LAG)
  useEffect(() => {
    let rafId: number
    const loop = () => {
      const el = document.getElementById(targetId)
      const container = containerRef.current

      if (el && container) {
        const targetRect = el.getBoundingClientRect()

        // Find the closest relative parent container
        const parent = container.offsetParent as HTMLElement
        const parentRect = parent
          ? parent.getBoundingClientRect()
          : { left: 0, top: 0 }

        // Account for any borders on the parent container so math is pixel-perfect
        const parentBorderLeft = parent
          ? parseFloat(getComputedStyle(parent).borderLeftWidth) || 0
          : 0
        const parentBorderTop = parent
          ? parseFloat(getComputedStyle(parent).borderTopWidth) || 0
          : 0

        // 1. Calculate Target's anchor point in the viewport
        const targetPxX = targetRect.left + targetRect.width * targetAnchor.x
        const targetPxY = targetRect.top + targetRect.height * targetAnchor.y

        // 2. Subtract the parent's position from the target's position.
        // Because scrolling moves BOTH the target and the parent equally,
        // this calculation remains exactly the same during a scroll!
        const finalX =
          targetPxX - parentRect.left - parentBorderLeft - size * svgAnchor.x
        const finalY =
          targetPxY - parentRect.top - parentBorderTop - size * svgAnchor.y

        // Apply immediately
        container.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`

        if (!isInitialized.current) {
          isInitialized.current = true
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafId)
  }, [targetId, targetAnchor, svgAnchor, size])

  // 2. Measure & Orchestrate Timeline
  useEffect(() => {
    const checkInit = setInterval(() => {
      if (isInitialized.current && pathRef.current) {
        clearInterval(checkInit)
        const length = pathRef.current.getTotalLength()
        setPathLength(length)

        setTimeout(() => setStep(1), delay)
        setTimeout(() => setStep(2), delay + duration * 1000)
      }
    }, 50)
    return () => clearInterval(checkInit)
  }, [delay, duration, path])

  return (
    <div
      ref={containerRef}
      className={cn(
        // CRITICAL CHANGE: 'fixed' changed to 'absolute'.
        // This forces it to scroll naturally with the page instead of chasing it with JS.
        "pointer-events-none absolute top-0 left-0 z-10",
        step === 0 && "opacity-0"
      )}
      style={{ width: size, height: size }}
    >
      {/* THE CONTENT/TEXT WRAPPER */}
      <div
        className={cn(
          "pointer-events-auto absolute min-w-[220px] transition-opacity ease-in-out",
          "font-['Caveat',_cursive] text-xl tracking-wide text-foreground",
          step >= 2 ? "opacity-100" : "opacity-0",
          textPosition,
          textClassName
        )}
        style={{ transitionDuration: `${duration * 0.8}s` }}
      >
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
