"use client"

import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import Link from "next/link"
import { ReactNode, useEffect, useRef } from "react"

export interface VideoExploreButtonProps {
  /** The trigger that dictates when the sequence begins */
  isRevealed?: boolean
  buttonWidth?: number
  buttonHeight?: number
  videoHeight?: number
  padding?: number
  gap?: number
  canvasRadius?: number
  videoRadius?: number
  buttonRadius?: number
  videoSrc?: string
  buttonText?: ReactNode
  href?: string
  buttonClassName?: string
  canvasClassName?: string
  videoContainerClassName?: string
}

export function VideoExploreButton({
  isRevealed = false,
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
  href = "/components",
  buttonClassName,
  canvasClassName,
  videoContainerClassName,
}: VideoExploreButtonProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Start playing the video precisely when the reveal animation starts
  // so it's already rolling smoothly behind the mask before it dissolves.
  useEffect(() => {
    if (isRevealed && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [isRevealed])

  // --- THE MATH & TIMING ---
  const canvasRestWidth = buttonWidth
  const canvasHoverWidth = buttonWidth + padding * 2

  // Sequence 1: Canvas fades in and wraps the button
  const canvasBaseTransition = {
    duration: 0.6,
    ease: "easeOut",
    delay: isRevealed ? 0 : 0.45,
  }

  // Sequence 2: Canvas grows upward & Video slides into place
  const growthTransition = {
    type: "spring",
    bounce: 0,
    duration: 1.2,
    delay: isRevealed ? 0.9 : 0.15,
  }

  // Sequence 3: The solid Primary curtain dissolves to reveal the video
  const curtainTransition = {
    duration: 0.15,
    ease: "linear",
    delay: isRevealed ? 0.5 : 0,
  }

  return (
    <div
      className="relative z-50 flex items-end justify-center"
      style={{ width: buttonWidth, height: buttonHeight }}
    >
      {/* 
        LAYER 1: THE MUTED CANVAS 
      */}
      <motion.div
        className={cn(
          "absolute bottom-0 left-1/2 flex flex-col justify-end overflow-hidden bg-muted",
          canvasClassName
        )}
        style={{ x: "-50%", transformOrigin: "bottom center" }}
        initial={false}
        animate={{
          width: isRevealed ? canvasHoverWidth : canvasRestWidth,
          padding: isRevealed ? padding : 0,
          y: isRevealed ? padding : 0,
          opacity: isRevealed ? 1 : 0,
          borderRadius: isRevealed ? canvasRadius : buttonRadius,
        }}
        transition={canvasBaseTransition}
      >
        <motion.div
          className="w-full shrink-0"
          initial={false}
          animate={{ height: isRevealed ? videoHeight + gap : 0 }}
          transition={growthTransition}
        />
        <div className="w-full shrink-0" style={{ height: buttonHeight }} />
      </motion.div>

      {/* 
        LAYER 2: THE PRIMARY MASK & VIDEO CONTAINER 
      */}
      <div
        className="pointer-events-none absolute z-10 overflow-hidden"
        style={{
          bottom: buttonHeight,
          left: "50%",
          transform: "translateX(-50%)",
          width: buttonWidth,
          height: videoHeight + gap,
        }}
      >
        <motion.div
          className={cn(
            "absolute top-0 w-full overflow-hidden",
            videoContainerClassName
          )}
          style={{
            height: videoHeight,
            borderRadius: videoRadius,
            willChange: "transform",
          }}
          initial={false}
          animate={{
            y: isRevealed ? 0 : videoHeight + gap,
          }}
          transition={growthTransition}
        >
          <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-overlay" />
          <video
            ref={videoRef}
            src={videoSrc}
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="auto"
          />

          {/* LAYER 2.5: THE PRIMARY THEATER CURTAIN */}
          <motion.div
            className="absolute inset-0 z-10 bg-primary"
            initial={false}
            animate={{ opacity: isRevealed ? 0 : 1 }}
            transition={curtainTransition}
          />
        </motion.div>
      </div>

      {/* 
        LAYER 3: THE CORE BUTTON
      */}
      <Link
        href={href}
        className={cn(
          "absolute bottom-0 left-0 z-20 flex cursor-pointer items-center justify-center bg-foreground text-background transition-transform focus-visible:outline-none active:scale-[0.98]",
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
      </Link>
    </div>
  )
}
