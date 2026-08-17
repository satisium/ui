"use client"

import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

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
// ACTION GROUP COMPONENT
// ==========================================
export interface ExploreActionGroupProps {
  exploreText?: string
  exploreHref?: string
  repo?: string
  className?: string
}

export function ExploreActionGroup({
  exploreText = "Explore components",
  exploreHref = "/docs/components",
  repo = "satisium/ui",
  className,
}: ExploreActionGroupProps) {
  const stars = useGithubStars(repo)
  const [isGithubHovered, setIsGithubHovered] = useState(false)

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center justify-center gap-2 sm:max-w-none sm:gap-3.5",
        className
      )}
    >
      {/* 1. PRIMARY CTA */}
      <Link
        href={exploreHref}
        /* 
          REMOVED: `shadow-sm`, `sm:rounded-[1.25rem]`
          LOCKED TO: `rounded-xl` (12px) 
        */
        className="inline-flex h-11 items-center justify-center rounded-[16px] bg-foreground px-4 font-heading text-xs font-semibold whitespace-nowrap text-background transition-transform duration-300 hover:scale-[1.02] focus:outline-none active:scale-[0.98] sm:h-14 sm:px-7 sm:text-sm"
      >
        {exploreText}
      </Link>

      {/* 2. SECONDARY GITHUB CTA */}
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsGithubHovered(true)}
        onMouseLeave={() => setIsGithubHovered(false)}
        /* 
          REMOVED: All border classes, `sm:rounded-[1.25rem]`
          LOCKED TO: `rounded-xl` (12px)
        */
        className="group relative inline-flex h-11 flex-col items-center justify-start overflow-hidden rounded-[16px] bg-transparent transition-all duration-300 hover:bg-card/50 hover:backdrop-blur-sm active:scale-[0.98] sm:h-14 dark:hover:bg-secondary/40"
      >
        <motion.div
          className="flex w-full flex-col"
          initial={false}
          animate={{ y: isGithubHovered ? "-50%" : "0%" }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        >
          {/* STATE 1: DEFAULT (GitHub Icon + Stars) */}
          <div className="flex h-11 w-full items-center justify-center gap-2 px-4 whitespace-nowrap sm:h-14 sm:gap-2.5 sm:px-5">
            {/* OFFICIAL GITHUB ICON */}
            <div className="relative size-4 shrink-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:size-5">
              <Image
                src="/github-mark.svg"
                alt="GitHub"
                fill
                className="block object-contain dark:hidden"
                loading="lazy"
              />
              <Image
                src="/github-mark-white.svg"
                alt="GitHub"
                fill
                className="hidden object-contain dark:block"
                loading="lazy"
              />
            </div>

            <span className="flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground sm:gap-1.5">
              <span className="font-sans text-xs leading-none font-semibold tracking-wide sm:text-sm">
                {stars}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-3 -translate-y-[1px] text-yellow-500 drop-shadow-sm sm:size-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          {/* STATE 2: HOVERED (Text + Arrow ONLY, No GitHub Icon) */}
          <div className="flex h-11 w-full items-center justify-center gap-1.5 px-4 whitespace-nowrap sm:h-14 sm:gap-2 sm:px-5">
            <span className="font-heading text-xs font-bold tracking-wide text-foreground sm:text-sm">
              Star on GitHub
            </span>
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              className="size-3.5 -translate-y-[0.5px] text-foreground sm:size-4"
            />
          </div>
        </motion.div>
      </a>
    </div>
  )
}
