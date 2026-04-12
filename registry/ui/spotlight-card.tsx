"use client"

import React, { useRef, MouseEvent } from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Standard Shadcn utility (usually in lib/utils.ts)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  glowRadius?: number
}

export function SpotlightCard({
  children,
  className,
  glowColor = "rgba(255, 255, 255, 0.08)", // Subtle white glow for dark mode
  glowRadius = 300,
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(-glowRadius) // Start safely off-screen
  const mouseY = useMotionValue(-glowRadius)

  function handleMouseMove({ clientX, clientY }: MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return
    const { left, top } = containerRef.current.getBoundingClientRect()
    // Calculate mouse position relative to the card
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md",
        className
      )}
      {...props}
    >
      {/* The Dynamic Spotlight Overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${glowRadius}px circle at ${mouseX}px ${mouseY}px,
              ${glowColor},
              transparent 80%
            )
          `,
        }}
      />
      {/* The Content */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
