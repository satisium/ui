"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import Link from "next/link" // Using Next.js Link for internal routing

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
  exploreHref = "/components",
  repo = "shadcn-ui/ui",
  className,
}: ExploreActionGroupProps) {
  const stars = useGithubStars(repo)
  const [isGithubHovered, setIsGithubHovered] = useState(false)

  return (
    <div 
      // Add pointer-events-auto here so clicks register even if parent ignores them!
      className={cn("pointer-events-auto flex flex-wrap items-center gap-3 sm:gap-4", className)}
    >
      
      {/* 1. PRIMARY CTA (Next.js Link for internal navigation) */}
      <Link
        href={exploreHref}
        className="inline-flex h-12 sm:h-14 items-center justify-center rounded-[1rem] sm:rounded-[1.25rem] bg-foreground px-6 sm:px-8 font-heading text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
      >
        {exploreText}
      </Link>

      {/* 2. SECONDARY GITHUB CTA (Standard 'a' tag for external links) */}
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsGithubHovered(true)}
        onMouseLeave={() => setIsGithubHovered(false)}
        className="group flex h-12 sm:h-14 items-center gap-2.5 rounded-[1rem] sm:rounded-[1.25rem] bg-transparent px-4 transition-colors duration-300 hover:bg-foreground/5 focus:outline-none"
      >
        {/* OFFICIAL GITHUB ICON (Theme Aware) */}
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
            {/* Default State: Stars */}
            <span className="flex h-[20px] items-center font-sans text-sm font-semibold tracking-wide text-muted-foreground transition-colors group-hover:text-foreground">
              {stars}
            </span>
            
            {/* Hover State: Text & Arrow */}
            <span className="flex h-[20px] items-center gap-1 font-heading text-sm font-bold tracking-wide text-foreground">
              Star on GitHub
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5" />
            </span>
          </motion.div>
        </div>
      </a>

    </div>
  )
}