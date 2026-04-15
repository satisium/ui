"use client"

import { cn } from "@/lib/utils"
import { PackageManager, usePackageManager } from "@/store"
import { Check, ChevronDown, Copy } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState } from "react"
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

  return (
    <div
      className={cn(
        "w-full max-w-3xl rounded-3xl border border-border/50 bg-muted/50 p-1.5 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 pt-1 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>

        <div className="flex items-center gap-1.5">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <SelectedIcon className="h-3.5 w-3.5" />
              <span className="hidden capitalize sm:inline-block">
                {manager}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
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
                  className="absolute top-full right-0 z-50 mt-1.5 w-32 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
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
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                          manager === pm
                            ? "bg-accent text-accent-foreground"
                            : "text-popover-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="capitalize">{pm}</span>
                        {manager === pm && (
                          <Check className="ml-auto h-3 w-3" />
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
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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

      <div className="relative flex h-12 items-center overflow-hidden rounded-2xl border border-border/50 bg-background px-4 shadow-sm">
        <AnimatePresence mode="popLayout">
          <motion.code
            key={commandString}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute left-4 font-mono text-sm font-medium text-foreground"
          >
            {commandString}
          </motion.code>
        </AnimatePresence>
      </div>
    </div>
  )
}
