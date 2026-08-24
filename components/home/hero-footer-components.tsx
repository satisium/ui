"use client"

import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { ReactNode, useEffect, useRef, useState } from "react"

// ==========================================
// DATA HOOK: Live GitHub Stars
// ==========================================
function useGithubStars(repo: string) {
  const [stars, setStars] = useState<string>("...")

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`)
        const data = await res.json()
        if (data.stargazers_count) {
          const formatted = Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(data.stargazers_count)
          setStars(formatted)
        }
      } catch (error) {
        logger.error("Failed to fetch stars", error)
        setStars("1k+")
      }
    }
    fetchStars()
  }, [repo])

  return stars
}

// ==========================================
// 1. DESKTOP GITHUB BUTTON (Unchanged)
// ==========================================
export function DesktopGithubButton({
  repo = "satisium/ui",
}: {
  repo?: string
}) {
  const stars = useGithubStars(repo)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={`https://github.com/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex h-[56px] items-center gap-4 px-2 transition-all focus-visible:outline-none"
    >
      <div className="relative size-5 shrink-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
        <Image
          src="/github-mark.svg"
          alt="GitHub"
          fill
          className="block object-contain dark:hidden"
        />
        <Image
          src="/github-mark-white.svg"
          alt="GitHub"
          fill
          className="hidden object-contain dark:block"
        />
      </div>

      <div className="relative h-[20px] overflow-hidden">
        <motion.div
          className="flex flex-col"
          initial={false}
          animate={{ y: isHovered ? -20 : 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        >
          <span className="flex h-[20px] items-center gap-1.5 font-sans text-sm font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground">
            {stars}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="-mt-[1px] size-3.5 text-yellow-500 drop-shadow-sm"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <span className="flex h-[20px] items-center gap-1 font-heading text-sm font-bold tracking-wide text-foreground">
            Star on GitHub
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
          </span>
        </motion.div>
      </div>
    </a>
  )
}

// ==========================================
// 2. MOBILE MEDIA CARD
// ==========================================
export interface MobileMediaCardProps {
  isRevealed?: boolean // Now controls the exact macro-choreography timing
  videoAspectRatio?: string
  buttonHeight?: number
  padding?: number
  gap?: number
  canvasRadius?: number
  videoRadius?: number
  buttonRadius?: number
  videoSrc?: string
  exploreText?: ReactNode
  exploreHref?: string
  repo?: string
  containerClassName?: string
  videoContainerClassName?: string
  actionRowClassName?: string
  exploreButtonClassName?: string
  githubButtonClassName?: string
}

export function MobileMediaCard({
  isRevealed = false,
  videoAspectRatio = "16 / 9",
  buttonHeight = 48,
  padding = 8,
  gap = 8,
  canvasRadius = 24,
  videoRadius = 16,
  buttonRadius = 16,
  videoSrc = "https://res.cloudinary.com/ddon6aux0/video/upload/v1787564837/ui-v3/previews/teaser.mp4",
  exploreText = "Explore components",
  exploreHref = "/components",
  repo = "satisium/ui",
  containerClassName,
  videoContainerClassName,
  actionRowClassName,
  exploreButtonClassName,
  githubButtonClassName,
}: MobileMediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stars = useGithubStars(repo)

  // Start playing the video the instant the reveal triggers,
  // pre-rolling it behind the dissolving mask.
  useEffect(() => {
    if (isRevealed && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [isRevealed])

  // --- THE MATH & TIMING (Exactly synced to the Desktop code) ---

  // Seq 1: Canvas wrap (Fades in instantly behind the buttons)
  const canvasBaseTransition = {
    duration: 0.6,
    ease: "easeOut" as const,
    delay: isRevealed ? 0 : 0.45,
  }

  // Seq 2: The solid Primary curtain dissolves to show the rolling video
  // Happens at 0.5s (wait... 800ms delay + 500ms = 1.3s after Hero load)
  const curtainTransition = {
    duration: 0.15,
    ease: "linear" as const,
    delay: isRevealed ? 0.5 : 0,
  }

  // Seq 3: Video smoothly expands the height and slides up into view
  // Happens at 0.9s (wait... 800ms delay + 900ms = 1.7s after Hero load)
  const growthTransition = {
    type: "spring" as const,
    bounce: 0,
    duration: 1.2,
    delay: isRevealed ? 0.9 : 0.15,
  }

  return (
    <div className={cn("relative flex w-full flex-col", containerClassName)}>
      {/* 
        LAYER 1: THE MUTED CANVAS BACKGROUND 
        Fades in instantly to form a "Dock" around the buttons.
      */}
      <motion.div
        className="absolute inset-0 z-0 bg-muted"
        initial={false}
        animate={{
          opacity: isRevealed ? 1 : 0,
          borderRadius: isRevealed ? canvasRadius : buttonRadius,
        }}
        transition={canvasBaseTransition}
      />

      {/* 
        LAYER 2: IN-FLOW CONTENT WRAPPER 
        This is where the magic happens. We animate padding and "auto" height. 
        Because it is in standard DOM flow, it smoothly and naturally pushes the 
        parent layout (and your H1 text) upwards WITHOUT overlapping.
      */}
      <motion.div
        className="relative z-10 flex w-full flex-col"
        initial={false}
        animate={{ padding: isRevealed ? padding : 0 }}
        transition={canvasBaseTransition}
      >
        {/* THE VIDEO EXPANSION WRAPPER */}
        <motion.div
          className="w-full origin-bottom overflow-hidden"
          initial={false}
          // Native auto-height calculation based on the child's aspect-ratio
          animate={{ height: isRevealed ? "auto" : 0 }}
          transition={growthTransition}
        >
          {/* We apply the bottom gap here so it collapses to exactly 0 when closed */}
          <div
            className="w-full"
            style={{
              paddingBottom: isRevealed ? gap : 0,
              transition: `padding ${growthTransition.duration}s`,
            }}
          >
            {/* THE ACTUAL VIDEO MASK */}
            <motion.div
              className={cn(
                "relative w-full overflow-hidden bg-black/10",
                videoContainerClassName
              )}
              style={{
                aspectRatio: videoAspectRatio,
                borderRadius: videoRadius,
              }}
              initial={false}
              // This is what gives it that beautiful "sliding up out of the mask" feel
              animate={{ y: isRevealed ? 0 : "100%" }}
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

              {/* THE PRIMARY THEATER CURTAIN */}
              <motion.div
                className="absolute inset-0 z-30 bg-primary"
                initial={false}
                animate={{ opacity: isRevealed ? 0 : 1 }}
                transition={curtainTransition}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* 
          LAYER 3: THE ACTION ROW (The Core Buttons) 
          These sit at the bottom. The background wraps around them, 
          and the video expands directly above them.
        */}
        <div
          className={cn(
            "relative z-20 flex w-full shrink-0 items-center justify-between",
            actionRowClassName
          )}
          style={{ height: buttonHeight, gap }}
        >
          <Link
            href={exploreHref}
            className={cn(
              "flex h-full w-[60%] shrink-0 cursor-pointer items-center justify-center bg-foreground px-2 text-background transition-transform focus-visible:outline-none active:scale-[0.98]",
              exploreButtonClassName
            )}
            style={{ borderRadius: buttonRadius }}
          >
            <span className="overflow-hidden font-heading text-[13px] font-medium tracking-wide text-ellipsis whitespace-nowrap">
              {exploreText}
            </span>
          </Link>

          <a
            href={`https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex h-full flex-1 items-center justify-center gap-3 bg-transparent px-2 transition-transform focus-visible:outline-none active:scale-[0.98]",
              githubButtonClassName
            )}
            style={{ borderRadius: buttonRadius }}
          >
            {/* OFFICIAL GITHUB ICON */}
            <div className="relative size-4 shrink-0 opacity-70">
              <Image
                src="/github-mark.svg"
                alt="GitHub"
                fill
                className="block object-contain dark:hidden"
              />
              <Image
                src="/github-mark-white.svg"
                alt="GitHub"
                fill
                className="hidden object-contain dark:block"
              />
            </div>

            {/* NUMBERS + GOLD STAR */}
            <span className="flex items-center gap-1.5 font-sans text-[13px] font-semibold tracking-wide text-muted-foreground">
              {stars}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="-mt-[1px] size-3.5 text-yellow-500 drop-shadow-sm"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </a>
        </div>
      </motion.div>
    </div>
  )
}
