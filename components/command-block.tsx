"use client"

import { Check, ChevronDown, Copy } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { PackageManager, usePackageManager } from "@/store"
import { BunIcon, NpmIcon, PnpmIcon, YarnIcon } from "./icons"

interface CommandBlockProps {
  title?: string
  pkg?: string
  cli?: string
  commands?: Partial<Record<PackageManager, string>>
  className?: string
}

const PM_CONFIG = {
  npm: { icon: NpmIcon, label: "npm" },
  pnpm: { icon: PnpmIcon, label: "pnpm" },
  yarn: { icon: YarnIcon, label: "yarn" },
  bun: { icon: BunIcon, label: "bun" },
} as const

// ✨ The Premium Mac-style Scrollbar
const scrollbarClasses = cn(
  "[scrollbar-width:thin][scrollbar-color:var(--border)_transparent]",
  "[&::-webkit-scrollbar]:h-2.5",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:min-w-[40px]",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:border-[3px]",
  "[&::-webkit-scrollbar-thumb]:border-solid",
  "[&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
  "[&::-webkit-scrollbar-thumb]:bg-border/40",
  "hover:[&::-webkit-scrollbar-thumb]:bg-border/80"
)

export function CommandBlock({
  title = "CLI Install",
  pkg,
  cli,
  commands,
  className,
}: CommandBlockProps) {
  const { manager, setManager } = usePackageManager()
  const [copied, setCopied] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getCommand = () => {
    if (commands && commands[manager]) return commands[manager]!
    if (pkg) {
      switch (manager) {
        case "npm":
          return `npm install ${pkg}`
        case "yarn":
          return `yarn add ${pkg}`
        case "pnpm":
          return `pnpm add ${pkg}`
        case "bun":
          return `bun add ${pkg}`
      }
    }
    if (cli) {
      switch (manager) {
        case "npm":
          return `npx shadcn@latest add ${cli}`
        case "yarn":
          return `yarn dlx shadcn@latest add ${cli}`
        case "pnpm":
          return `pnpm dlx shadcn@latest add ${cli}`
        case "bun":
          return `bunx shadcn@latest add ${cli}`
      }
    }
    return "echo 'No command specified'"
  }

  const commandString = getCommand()

  const handleCopy = () => {
    navigator.clipboard.writeText(commandString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const SelectedIcon = PM_CONFIG[manager].icon

  // ✨ Auto-Tokenizer Engine (Zero dependencies, perfectly highlights commands)
  const renderHighlightedCommand = (cmd: string) => {
    const parts = cmd.split(" ")
    return parts.map((part, idx) => {
      // Highlight executables (npm, pnpm, npx, etc.)
      if (idx === 0) {
        return (
          <span key={idx} className="font-semibold text-primary/80">
            {part}{" "}
          </span>
        )
      }
      // Highlight flags (-D, --save)
      if (part.startsWith("-")) {
        return (
          <span key={idx} className="text-muted-foreground/80">
            {part}{" "}
          </span>
        )
      }
      // Highlight subcommands (install, add, dlx)
      if (["install", "add", "remove", "dlx", "create"].includes(part)) {
        return (
          <span key={idx} className="text-muted-foreground">
            {part}{" "}
          </span>
        )
      }
      // Default color for package names
      return (
        <span key={idx} className="text-foreground">
          {part}{" "}
        </span>
      )
    })
  }

  return (
    <div
      className={cn("w-full max-w-3xl rounded-3xl bg-muted/50 p-2", className)}
    >
      <div className="flex items-center justify-between px-3 pt-1 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>

        <div className="flex items-center gap-1.5">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Select package manager"
              aria-expanded={isDropdownOpen}
              className="flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-medium text-foreground drop-shadow-2xl transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <SelectedIcon className="h-3.5 w-3.5" />
              <span className="hidden capitalize sm:inline-block">
                {manager}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-full right-0 z-50 mt-1.5 w-32 overflow-hidden rounded-md bg-popover/95 p-2 drop-shadow-2xl backdrop-blur-md"
                >
                  {(Object.keys(PM_CONFIG) as PackageManager[]).map((pm) => {
                    const Icon = PM_CONFIG[pm].icon
                    return (
                      <button
                        key={pm}
                        onClick={() => {
                          setManager(pm)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          manager === pm
                            ? "bg-accent font-medium text-accent-foreground"
                            : "text-popover-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="capitalize">{pm}</span>
                        {manager === pm && (
                          <Check className="ml-auto h-3 w-3 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleCopy}
            title="Copy command"
            aria-label="Copy command to clipboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground drop-shadow-2xl transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ✨ FIX: Redesigned container to allow fluid horizontal scrolling without breaking layout animations */}
      <div
        className={cn(
          "relative flex min-h-[48px] items-center overflow-x-auto rounded-2xl bg-background px-4 py-3",
          scrollbarClasses
        )}
      >
        {/* The un-selectable dollar prompt */}
        <span className="mr-3 shrink-0 font-mono text-[13px] leading-6 text-muted-foreground/50 select-none">
          $
        </span>

        {/* We use mode="wait" so absolute positioning isn't forced, allowing horizontal scroll width to compute correctly */}
        <AnimatePresence mode="wait">
          <motion.code
            key={commandString}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-max flex-1 font-mono text-[13px] leading-6 whitespace-nowrap"
          >
            {renderHighlightedCommand(commandString)}
          </motion.code>
        </AnimatePresence>
      </div>
    </div>
  )
}
