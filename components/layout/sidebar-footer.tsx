"use client"

import {
  LaptopIcon,
  MoonSlowWindIcon,
  NewTwitterIcon,
  Sun02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
import { switchThemeWithTransition } from "@/lib/theme-transition"

export const SidebarFooter = () => {
  return (
    <div className="flex w-full gap-2">
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
              className="group flex size-10 flex-shrink-0 items-center justify-center rounded-[12px] bg-background text-muted-foreground backdrop-blur-md transition-all hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <HugeiconsIcon
                icon={NewTwitterIcon}
                className="size-3.5 fill-current transition-transform duration-300 group-hover:scale-110"
              />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={12} className="text-xs">
            Connect with me on X
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="h-10 w-full rounded-full border border-border/50 bg-background/50" />
    )
  }

  const options = [
    { value: "light", icon: Sun02Icon, label: "Light" },
    { value: "system", icon: LaptopIcon, label: "System" },
    { value: "dark", icon: MoonSlowWindIcon, label: "Dark" },
  ]

  const handleThemeChange = (
    e: React.MouseEvent<HTMLButtonElement>,
    newTheme: string
  ) => {
    if (theme === newTheme) return

    // ✨ Execute transition starting exactly from the user's mouse click
    switchThemeWithTransition(setTheme, newTheme, e, "cursor")
  }

  return (
    <div className="flex h-10 w-full items-center gap-1 rounded-[12px] bg-background p-1.5">
      {options.map((opt) => {
        const isActive = theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={(e) => handleThemeChange(e, opt.value)}
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
            <HugeiconsIcon icon={opt.icon} className="relative z-10 size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
