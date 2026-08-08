"use client"

import { cn } from "@/lib/utils"
import { ArrowUpRight01Icon, PlayIcon } from "@hugeicons/core-free-icons"
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
      // INCREASED GAP: Changed from gap-2.5 to gap-4 (16px) for premium breathing room
      className="group flex h-[56px] items-center gap-4 px-2 transition-all focus-visible:outline-none"
    >
      {/* 
        OFFICIAL GITHUB ICON (Theme Aware) 
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
          {/* DEFAULT STATE: Numbers + Gold Star */}
          <span className="flex h-[20px] items-center gap-1.5 font-sans text-sm font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground">
            {stars}
            {/* 
              GOLD STAR: 
              - fill="currentColor" and text-yellow-500 creates the rich gold
              -mt-[1px] corrects the font baseline optical illusion 
            */}
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

          {/* HOVER STATE: Text & Arrow */}
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
  exploreHref = "/components",
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
        <Link
          href={exploreHref}
          className={cn(
            "flex h-full w-[60%] shrink-0 cursor-pointer items-center justify-center bg-foreground px-2 text-background transition-transform focus-visible:outline-none active:scale-95",
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
            // INCREASED GAP: Changed from gap-2 to gap-3 for mobile breathing room
            "flex h-full flex-1 items-center justify-center gap-3 bg-transparent px-2 transition-transform focus-visible:outline-none active:scale-95",
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
    </div>
  )
}
