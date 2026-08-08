"use client"

import { cn } from "@/lib/utils"
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
        console.error("Failed to fetch stars", error)
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
  repo = "shadcn-ui/ui",
  className,
}: ExploreActionGroupProps) {
  const stars = useGithubStars(repo)
  const [isGithubHovered, setIsGithubHovered] = useState(false)

  return (
    <div
      className={cn(
        "pointer-events-auto flex flex-wrap items-center gap-3 sm:gap-4",
        className
      )}
    >
      {/* 1. PRIMARY CTA */}
      <Link
        href={exploreHref}
        className="inline-flex h-12 items-center justify-center rounded-[1rem] bg-foreground px-6 font-heading text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] focus:outline-none active:scale-[0.98] sm:h-14 sm:rounded-[1.25rem] sm:px-8"
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
        className="group flex h-12 items-center gap-3 rounded-[1rem] bg-transparent px-4 transition-colors duration-300 hover:bg-foreground/5 focus:outline-none sm:h-14 sm:gap-4 sm:rounded-[1.25rem]"
      >
        {/* OFFICIAL GITHUB ICON */}
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

        {/* ANIMATED TEXT WRAPPER */}
        <div className="relative h-[20px] overflow-hidden">
          <motion.div
            className="flex flex-col"
            initial={false}
            animate={{ y: isGithubHovered ? -20 : 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            {/* DEFAULT STATE: Numbers + Star (PERFECTLY ALIGNED) */}
            <span className="flex h-[20px] items-center gap-1.5 text-muted-foreground transition-colors group-hover:text-foreground">
              {/* `leading-none` strips font padding for true centering */}
              <span className="font-sans text-sm leading-none font-semibold tracking-wide">
                {stars}
              </span>

              {/* 
                -translate-y-[1px] perfectly nudges the star up optically
                size-3.5 matches the 14px text-sm exactly 
              */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-3.5 -translate-y-[1px] text-yellow-500 drop-shadow-sm"
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
              <span className="leading-none">Star on GitHub</span>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                className="size-3.5 -translate-y-[0.5px]"
              />
            </span>
          </motion.div>
        </div>
      </a>
    </div>
  )
}
