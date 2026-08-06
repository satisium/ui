"use client"

import React, { ReactNode, useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image" // Using Next/Image for optimized loading

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
        console.error("Failed to fetch stars", error)
        setStars("1k+")
      }
    }
    fetchStars()
  }, [repo])

  return stars
}

// ==========================================
// 1. DESKTOP GITHUB BUTTON
// ==========================================
export function DesktopGithubButton({
  repo = "shadcn-ui/ui",
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
      className="group flex h-[56px] items-center gap-2.5 px-2 transition-all focus-visible:outline-none"
    >
      {/* 
        OFFICIAL GITHUB ICON (Theme Aware) 
        Uses opacity to mimic the muted-to-foreground color shift on hover.
      */}
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
          <span className="flex h-[20px] items-center font-sans text-sm leading-none font-semibold tracking-wide text-muted-foreground">
            {stars}
          </span>
          <span className="flex h-[20px] items-center gap-1 font-heading text-sm leading-none font-bold tracking-wide text-foreground">
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
  videoAspectRatio?: string
  buttonHeight?: number
  padding?: number
  gap?: number
  canvasRadius?: number
  videoRadius?: number
  buttonRadius?: number
  videoSrc?: string
  exploreText?: ReactNode
  repo?: string
  playIcon?: ReactNode
  containerClassName?: string
  videoContainerClassName?: string
  actionRowClassName?: string
  exploreButtonClassName?: string
  githubButtonClassName?: string
}

export function MobileMediaCard({
  videoAspectRatio = "16 / 9",
  buttonHeight = 48,
  padding = 8,
  gap = 8,
  canvasRadius = 24,
  videoRadius = 16,
  buttonRadius = 16,
  videoSrc = "https://res.cloudinary.com/ddon6aux0/video/upload/v1782129926/ui-v3/demos/videos/1.mp4",
  exploreText = "Explore components",
  repo = "shadcn-ui/ui",
  playIcon = (
    <HugeiconsIcon icon={PlayIcon} className="size-4 fill-white text-white" />
  ),
  containerClassName,
  videoContainerClassName,
  actionRowClassName,
  exploreButtonClassName,
  githubButtonClassName,
}: MobileMediaCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stars = useGithubStars(repo)

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden bg-muted",
        containerClassName
      )}
      style={{ padding, borderRadius: canvasRadius, gap }}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-black/10",
          videoContainerClassName
        )}
        style={{ aspectRatio: videoAspectRatio, borderRadius: videoRadius }}
      >
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/5 mix-blend-overlay" />
        <video
          ref={videoRef}
          src={videoSrc}
          className="h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          loop
        />
        <div className="absolute right-2 bottom-2 z-20 flex size-7 items-center justify-center rounded-[10px] bg-black/40 backdrop-blur-md">
          {playIcon}
        </div>
      </div>

      <div
        className={cn(
          "flex w-full items-center justify-between",
          actionRowClassName
        )}
        style={{ height: buttonHeight, gap }}
      >
        <button
          className={cn(
            "flex h-full w-[60%] shrink-0 cursor-pointer items-center justify-center bg-foreground px-2 text-background transition-transform focus-visible:outline-none active:scale-95",
            exploreButtonClassName
          )}
          style={{ borderRadius: buttonRadius }}
        >
          <span className="overflow-hidden font-heading text-[13px] font-medium tracking-wide text-ellipsis whitespace-nowrap">
            {exploreText}
          </span>
        </button>

        <a
          href={`https://github.com/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex h-full flex-1 items-center justify-center gap-2 bg-transparent px-2 transition-transform focus-visible:outline-none active:scale-95",
            githubButtonClassName
          )}
          style={{ borderRadius: buttonRadius }}
        >
          {/* 
            OFFICIAL GITHUB ICON (Mobile version)
          */}
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

          <span className="font-sans text-[13px] font-semibold tracking-wide text-muted-foreground">
            {stars}
          </span>
        </a>
      </div>
    </div>
  )
}
