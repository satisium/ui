"use client"

import { Heart, Monitor, Moon, Sun } from "lucide-react"
import { motion } from "motion/react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

export const SidebarFooter = () => {
  return (
    <div className="mt-auto flex-none flex-col rounded-3xl border bg-background p-2 drop-shadow-2xl">
      <div className="flex items-center gap-2 rounded-2xl border bg-muted p-2">
        <div className="flex-1">
          <ThemeSwitcher />
        </div>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="https://x.com/iamsatish4564"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex size-10 flex-shrink-0 items-center justify-center rounded-sm bg-background text-muted-foreground backdrop-blur-md transition-all hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
                aria-label="Connect with me on X"
              >
                <XLogo className="size-3.5 fill-current transition-transform duration-300 group-hover:scale-110" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={12} className="text-xs">
              Connect with me on X
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
        <span>Built with</span>
        <Heart className="size-3 text-red-500" />
        <span>by</span>
        <Link
          href={"https://satishkumar.xyz/"}
          target="_blank"
          className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
          Satishkumar
        </Link>
      </div>
    </div>
  )
}

/**
 * ThemeSwitcher Component
 * Handles Next Themes toggling with a fluid framer-motion active indicator.
 * Utilizes a mounted check to prevent React hydration mismatch errors.
 */
function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting until mounted to render the current theme state
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="h-10 w-full rounded-full border border-border/50 bg-background/50"
        aria-hidden="true"
      />
    )
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <div className="flex h-10 w-full items-center gap-1 rounded-sm bg-background p-1.5">
      {options.map((opt) => {
        const isActive = theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            aria-label={`Switch to ${opt.label} theme`}
            aria-pressed={isActive}
            className={`relative flex h-full flex-1 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
              isActive
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active-indicator"
                className="absolute inset-0 z-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <opt.icon className="relative z-10 size-3.5" />
          </button>
        )
      })}
    </div>
  )
}

/**
 * XLogo Component
 * Minimal SVG icon for X (formerly Twitter).
 */
function XLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
