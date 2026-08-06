"use client"

import React, { useState, useRef, useEffect, ReactNode } from "react"
import { motion, Spring } from "motion/react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

export interface VideoExploreButtonProps {
  // --- DIMENSIONS (Numbers only for precise layout math) ---
  /** Width of the resting button */
  buttonWidth?: number
  /** Height of the resting button */
  buttonHeight?: number
  /** Height of the expanded video player */
  videoHeight?: number
  /** Padding between the outer canvas and its internal elements */
  padding?: number
  /** Gap between the video player and the button */
  gap?: number

  // --- RADII (Geometry) ---
  /** Border radius of the expanded outer canvas */
  canvasRadius?: number
  /** Border radius of the video player */
  videoRadius?: number
  /** Border radius of the core button */
  buttonRadius?: number

  // --- CONTENT ---
  /** URL of the video to play on hover */
  videoSrc?: string
  /** The text or JSX inside the core button */
  buttonText?: ReactNode
  /** Custom icon to overlay on the video (defaults to Lucide Play) */
  playIcon?: ReactNode

  // --- STYLING (Tailwind classes) ---
  buttonClassName?: string
  canvasClassName?: string
  videoContainerClassName?: string

  // --- PHYSICS & TIMING ---
  /** Framer motion spring configuration */
  springConfig?: Spring
  /** Delay in ms before closing after mouse leave */
  unhoverDelay?: number
}

export function VideoExploreButton({
  buttonWidth = 240,
  buttonHeight = 56,
  videoHeight = 135,
  padding = 8,
  gap = 8,

  canvasRadius = 24,
  videoRadius = 16,
  buttonRadius = 16,

  videoSrc = "https://res.cloudinary.com/ddon6aux0/video/upload/v1782129926/ui-v3/demos/videos/1.mp4",
  buttonText = "Explore components",
  playIcon = <Play className="size-3 fill-white text-white" />,

  buttonClassName,
  canvasClassName,
  videoContainerClassName,

  // Apple-style heavy spring for premium feel
  springConfig = { type: "spring", bounce: 0.15, duration: 0.5 },
  unhoverDelay = 500,
}: VideoExploreButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }, unhoverDelay)
  }

  // --- THE ABSOLUTE MATH ---
  // Canvas perfectly wraps the button at rest.
  const canvasRestWidth = buttonWidth
  const canvasHoverWidth = buttonWidth + padding * 2
  const canvasRestHeight = buttonHeight
  const canvasHoverHeight = buttonHeight + videoHeight + gap + padding * 2

  // To keep the button hammered in place, the canvas translates down by the padding amount.
  const canvasRestY = 0
  const canvasHoverY = padding

  // Video sits exactly above the button and grows upwards.
  const videoRestY = -buttonHeight
  const videoHoverY = -(buttonHeight + gap)

  return (
    <div
      className="relative z-50 flex items-end justify-center"
      // The hitbox is permanently hammered to the resting button dimensions.
      // Because overflow is visible, hovering the expanded canvas still works flawlessly.
      style={{ width: buttonWidth, height: buttonHeight }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 
        LAYER 1: THE EXPANDING CANVAS 
        Fades in and mathematically grows AROUND the locked button.
      */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-1/2 origin-bottom overflow-hidden bg-muted",
          canvasClassName
        )}
        initial={false}
        animate={{
          width: isHovered ? canvasHoverWidth : canvasRestWidth,
          height: isHovered ? canvasHoverHeight : canvasRestHeight,
          y: isHovered ? canvasHoverY : canvasRestY,
          x: "-50%", // Keeps it perfectly centered
          opacity: isHovered ? 1 : 0, // Invisible at rest!
          borderRadius: isHovered ? canvasRadius : buttonRadius,
        }}
        transition={springConfig}
      />

      {/* 
        LAYER 2: THE VIDEO BLOCK 
        Anchored to the top of the button, expands upwards.
      */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-1/2 origin-bottom overflow-hidden bg-black/10",
          videoContainerClassName
        )}
        initial={false}
        animate={{
          width: buttonWidth,
          height: isHovered ? videoHeight : 0,
          y: isHovered ? videoHoverY : videoRestY,
          x: "-50%",
          opacity: isHovered ? 1 : 0,
          borderRadius: videoRadius,
        }}
        transition={springConfig}
      >
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-overlay" />
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-cover"
          muted
          playsInline
          loop
        />
        <motion.div
          className="absolute right-2 bottom-2 z-20 flex items-center justify-center rounded-full bg-black/40 p-1.5 backdrop-blur-md"
          initial={false}
          animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
          transition={{ delay: 0.1, ...springConfig }}
        >
          {playIcon}
        </motion.div>
      </motion.div>

      {/* 
        LAYER 3: THE CORE BUTTON
        Absolutely hammered to bottom-0 left-0. 
        It does not scale. It does not move. It dictates the entire layout.
      */}
      <div
        className={cn(
          "absolute bottom-0 left-0 flex cursor-pointer items-center justify-center bg-foreground text-background",
          buttonClassName
        )}
        style={{
          width: buttonWidth,
          height: buttonHeight,
          borderRadius: buttonRadius,
        }}
      >
        <span className="font-heading text-sm font-medium tracking-wide">
          {buttonText}
        </span>
      </div>
    </div>
  )
}
