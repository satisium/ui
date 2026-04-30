"use client"

import { CodeBlock } from "@/components/code-block/code-block"
import { CodeFile } from "@/components/code-block/types"
import { CommandBlock } from "@/components/command-block"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowLeft02Icon,
  ComputerTerminal01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useEffect, useState } from "react"

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
      // Prevent triggering if the user is typing in an input/textarea
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
    "flex h-10 w-10 items-center bg-background justify-center rounded-sm text-foreground transition-all hover:bg-muted/80 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"

  return (
    <TooltipProvider delayDuration={150}>
      <div className="absolute bottom-6 left-6 z-50 flex items-center gap-0.5 rounded-sm border bg-muted p-0.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:bottom-8 sm:left-8">
        {/* Hardcoded reliable fallback to components page */}
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

        <div className="h-5 w-px bg-border/50" />

        {/* Controlled Dialog */}
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
              <kbd className="rounded-sm border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                c
              </kbd>
            </TooltipContent>
          </Tooltip>

          <DialogContent className="flex w-[95vw] max-w-300 flex-col overflow-hidden rounded-3xl bg-muted p-0 sm:min-w-[60vw]">
            <DialogTitle className="sr-only">
              {componentName} Source Code
            </DialogTitle>

            <div className="flex h-[85vh] w-full flex-col gap-4 p-3 pt-4">
              {/* 1. Header Area */}
              <div className="flex shrink-0 flex-col gap-1.5 px-1">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
                  <HugeiconsIcon
                    icon={ComputerTerminal01Icon}
                    className="size-5 text-muted-foreground"
                  />
                  <span>Installation</span>
                </h2>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  Run the command below to add the{" "}
                  <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-foreground">
                    {componentName}
                  </span>{" "}
                  component to your project.
                </p>
              </div>

              {/* 
                2. Command Block & Code Block Wrapper
              */}
              <div className="flex min-h-0 w-full flex-1 flex-col gap-4 rounded-3xl bg-background p-2">
                <div className="shrink-0">
                  <CommandBlock
                    cli={installCommand || ""}
                    className="max-w-none"
                  />
                </div>

                <div className="relative flex min-h-0 flex-1 overflow-hidden">
                  <CodeBlock
                    files={files}
                    className="h-full w-full border border-border/40 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
