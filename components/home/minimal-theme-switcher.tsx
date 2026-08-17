"use client"

import {
  LaptopIcon,
  MoonSlowWindIcon,
  Sun02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { switchThemeWithTransition } from "@/lib/theme-transition"

export const MinimalThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  if (!mounted) {
    // SSR Fallback matches the exact resting state (naked 40x40 button, no bg)
    return <div className="h-10 w-10 rounded-[14px] bg-transparent" />
  }

  const options = [
    { value: "light", icon: Sun02Icon, label: "Light" },
    { value: "system", icon: LaptopIcon, label: "System" },
    { value: "dark", icon: MoonSlowWindIcon, label: "Dark" },
  ]

  const activeOption = options.find((o) => o.value === theme) || options[1]
  const inactiveOptions = options.filter((o) => o.value !== theme)

  const handleMouseEnter = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 500)
  }

  const cycleTheme = (e: React.MouseEvent) => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    switchThemeWithTransition(setTheme, nextTheme, e, "fade")
  }

  const selectTheme = (e: React.MouseEvent, newTheme: string) => {
    if (theme === newTheme) return
    switchThemeWithTransition(setTheme, newTheme, e, "fade")
  }

  return (
    <motion.div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // Animate container width and internal paddings/gaps dynamically
      animate={{
        width: isHovered ? "max-content" : 40,
        paddingLeft: isHovered ? 6 : 0,
        paddingRight: isHovered ? 6 : 0,
        gap: isHovered ? 4 : 0,
      }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      // No background or borders on the wrapper itself
      className="relative flex h-10 items-center overflow-hidden rounded-[14px]"
    >
      {/* 
        THE BACKGROUND LAYER
        Fades in purely on hover to create the "expanded container" illusion.
      */}
      <motion.div
        className="absolute inset-0 z-0 rounded-[14px] bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* 1. THE ACTIVE ICON (The Morphing Squircle) */}
      <motion.button
        onClick={cycleTheme}
        aria-label="Cycle theme"
        // Morphs from 40x40 (radius 14) to 28x28 (radius 8) perfectly
        animate={{
          width: isHovered ? 28 : 40,
          height: isHovered ? 28 : 40,
          borderRadius: isHovered ? 8 : 14,
        }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className="relative z-10 flex flex-shrink-0 items-center justify-center bg-foreground text-background transition-transform focus-visible:outline-none active:scale-95"
      >
        {/* Scale the icon down slightly when the button shrinks */}
        <motion.div animate={{ scale: isHovered ? 1 : 1.25 }}>
          <HugeiconsIcon icon={activeOption.icon} className="size-3.5" />
        </motion.div>
      </motion.button>

      {/* 2. THE INACTIVE ICONS */}
      {inactiveOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={(e) => selectTheme(e, opt.value)}
          aria-label={`Switch to ${opt.label} theme`}
          // Mathematically perfect inner radius (8px)
          className="relative z-10 flex size-7 flex-shrink-0 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground focus-visible:outline-none"
        >
          <HugeiconsIcon icon={opt.icon} className="size-3.5" />
        </button>
      ))}

      {/* 3. THE KEYBOARD HINT */}
      <div className="relative z-10 ml-1 flex flex-shrink-0 items-center pr-1.5 pl-1">
        <span className="font-sans text-[11px] font-medium tracking-widest text-muted-foreground/40">
          d
        </span>
      </div>
    </motion.div>
  )
}
