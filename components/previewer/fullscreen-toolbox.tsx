"use client"

import { CodeFile } from "@/components/code-block/types"
import { CommandMenuTrigger } from "@/components/layout/command-menu"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ArrowLeft02Icon, SourceCodeIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FullscreenCodeDialog } from "./fullscreen-code-dialog"

interface FullscreenToolboxProps {
  files: Record<string, CodeFile | string>
  componentName: string
  installCommand?: string
}

export function FullscreenToolbox({
  files,
  componentName,
  installCommand,
}: FullscreenToolboxProps) {
  const hasFiles = Object.keys(files).length > 0
  const [isOpen, setIsOpen] = useState(false)

  // Hotkey listener for toggling the code dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Prevent rapid toggling if the user holds the key down
      if (e.repeat) return

      // 2. Prevent triggering if the user is typing in an input/textarea
      const activeElement = document.activeElement
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA"

      if (isInput) return

      if (e.key.toLowerCase() === "c" && hasFiles) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasFiles])

  const buttonClasses =
    "flex h-10 w-10 items-center bg-background justify-center rounded-[12px] text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"

  // 🌟 The perfect, theme-adaptive KBD styling for tooltips
  const kbdClasses =
    "rounded-[4px] border border-current/20 bg-current/10 px-1.5 py-0.5 text-[10px] font-medium text-inherit uppercase opacity-80"

  return (
    <TooltipProvider delayDuration={150}>
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-1.5 rounded-[16px] border border-border bg-muted p-1.5 drop-shadow-2xl sm:bottom-8 sm:left-8">
        {/* 1. Go Back Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/docs/components" className={buttonClasses}>
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={12} className="font-medium">
            Go Back
          </TooltipContent>
        </Tooltip>

        {/* 2. Global Command Menu Trigger (Icon Variant) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <CommandMenuTrigger variant="icon" className={buttonClasses} />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={12}
            className="flex items-center gap-2 font-medium"
          >
            <span>Search</span>
            <kbd className={kbdClasses}>⌘K</kbd>
          </TooltipContent>
        </Tooltip>

        {/* 3. Controlled Source Code Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button disabled={!hasFiles} className={buttonClasses}>
                  <HugeiconsIcon icon={SourceCodeIcon} className="size-5" />
                </button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="flex items-center gap-2 font-medium"
            >
              <span>Installation & Source Code</span>
              <kbd className={kbdClasses}>c</kbd>
            </TooltipContent>
          </Tooltip>

          {/* Render the decoupled component */}
          <FullscreenCodeDialog
            files={files}
            componentName={componentName}
            installCommand={installCommand}
          />
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
