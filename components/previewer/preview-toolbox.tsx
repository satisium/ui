"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  ArrowDown01Icon,
  DocumentCodeIcon,
  GithubIcon,
  LaptopIcon,
  Refresh03Icon,
  Share04Icon,
  SmartPhone01Icon,
  SourceCodeIcon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "../ui/button"

import { DemoData } from "./component-preview"
import { ViewportMode } from "./resizable-playground"

export type AnchorPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

interface ToolbarProps {
  demos: DemoData[]
  activeDemoIndex: number
  setActiveDemoIndex: (val: number) => void
  isCodeOpen: boolean
  setIsCodeOpen: (v: boolean) => void
  viewportMode: ViewportMode
  onViewportChange: (mode: ViewportMode) => void
  onReload: () => void
  onScrollToSource: () => void
  githubUrl?: string
  previewUrl?: string
  hasSourceCodeId: boolean
  anchor?: AnchorPosition
  gridCols?: number
  collapsedRows?: number
  hotkeys?: {
    desktop?: string
    tablet?: string
    mobile?: string
    code?: string
    reload?: string
    scroll?: string
  }
}

const anchorClasses: Record<AnchorPosition, string> = {
  "top-left": "top-4 left-4 sm:top-6 sm:left-6",
  "top-center": "top-4 left-1/2 -translate-x-1/2 sm:top-6",
  "top-right": "top-4 right-4 sm:top-6 sm:right-6",
  "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6",
  "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
}

const originClasses: Record<AnchorPosition, string> = {
  "top-left": "top left",
  "top-center": "top center",
  "top-right": "top right",
  "bottom-left": "bottom left",
  "bottom-center": "bottom center",
  "bottom-right": "bottom right",
}

export function PreviewToolBox({
  demos,
  activeDemoIndex,
  setActiveDemoIndex,
  isCodeOpen,
  setIsCodeOpen,
  viewportMode,
  onViewportChange,
  onReload,
  onScrollToSource,
  githubUrl,
  previewUrl,
  hasSourceCodeId,
  anchor = "bottom-left",
  gridCols = 3,
  collapsedRows = 1,
  hotkeys = {
    desktop: "1",
    tablet: "2",
    mobile: "3",
    code: "c",
    reload: "r",
    scroll: "s",
  },
}: ToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA"

      if (isInput) return

      const key = e.key.toLowerCase()

      if (key === hotkeys.desktop) onViewportChange("desktop")
      if (key === hotkeys.tablet) onViewportChange("tablet")
      if (key === hotkeys.mobile) onViewportChange("mobile")
      if (key === hotkeys.code) setIsCodeOpen(!isCodeOpen)
      if (key === hotkeys.reload) onReload()
      if (key === hotkeys.scroll && hasSourceCodeId) onScrollToSource()
    },
    [
      hotkeys,
      onViewportChange,
      setIsCodeOpen,
      isCodeOpen,
      onReload,
      onScrollToSource,
      hasSourceCodeId,
    ]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const actions = [
    {
      id: "reload",
      icon: <HugeiconsIcon icon={Refresh03Icon} className="size-[14px]" />,
      label: "Reload Animation",
      hotkey: hotkeys.reload?.toUpperCase(),
      onClick: onReload,
      show: true,
      active: false,
    },
    {
      id: "code",
      icon: <HugeiconsIcon icon={SourceCodeIcon} className="size-[14px]" />,
      label: "Toggle Code",
      hotkey: hotkeys.code?.toUpperCase(),
      onClick: () => setIsCodeOpen(!isCodeOpen),
      show: true,
      active: isCodeOpen,
    },
    {
      id: "preview",
      icon: <HugeiconsIcon icon={Share04Icon} className="size-[14px]" />,
      label: "Open Isolated",
      onClick: () => window.open(previewUrl, "_blank", "noopener,noreferrer"),
      show: !!previewUrl,
      active: false,
    },
    {
      id: "github",
      icon: <HugeiconsIcon icon={GithubIcon} className="size-[14px]" />,
      label: "View GitHub",
      onClick: () => window.open(githubUrl, "_blank", "noopener,noreferrer"),
      show: !!githubUrl,
      active: false,
    },

    {
      id: "scroll",
      icon: <HugeiconsIcon icon={DocumentCodeIcon} className="size-[14px]" />,
      label: "Scroll to Source",
      hotkey: hotkeys.scroll?.toUpperCase(),
      onClick: onScrollToSource,
      show: hasSourceCodeId,
      active: false,
    },
  ].filter((a) => a.show)

  const isAnchoredBottom = anchor.startsWith("bottom")
  const tooltipSide = isAnchoredBottom ? "top" : "bottom"
  // Flip the layout direction based on top/bottom anchor so the expansion opens towards the center of the screen
  const flexDirClass = isAnchoredBottom ? "flex-col-reverse" : "flex-col"

  const baseActionCount = gridCols * collapsedRows
  const baseActions = actions.slice(0, baseActionCount)
  const extraActions = actions.slice(baseActionCount)
  const hasMoreActions = extraActions.length > 0

  const chevronRotation = isExpanded
    ? isAnchoredBottom
      ? 0
      : 180
    : isAnchoredBottom
      ? 180
      : 0

  const renderAction = (
    action: (typeof actions)[0],
    isHidden: boolean = false
  ) => (
    <Tooltip key={action.id}>
      <TooltipTrigger asChild>
        <Button
          tabIndex={isHidden ? -1 : 0}
          variant={action.active ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-8 w-full rounded-[10px] bg-muted transition-colors hover:bg-muted",
            action.active ? "bg-background hover:bg-background" : ""
          )}
          style={{ pointerEvents: isHidden ? "none" : "auto" }}
          onClick={action.onClick}
        >
          {action.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} className="flex items-center gap-2">
        <span className="text-xs">{action.label}</span>
        {action.hotkey && (
          <kbd className="rounded-[4px] border border-current/20 bg-current/10 px-1.5 py-0.5 text-[10px] font-medium opacity-80">
            {action.hotkey}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )

  return (
    <motion.div
      layout
      className={cn(
        // ✨ Removed nested bulky padding, now a slim, highly-dense wrapper
        "absolute z-10 rounded-2xl border border-border/40 bg-background p-1.5 drop-shadow-2xl",
        anchorClasses[anchor]
      )}
      style={{ transformOrigin: originClasses[anchor] }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className={cn("flex gap-1.5", flexDirClass)}>
        {/* UPPER/LOWER MAIN CONTROLS (Viewport & Select) */}
        <div className="flex flex-col gap-1.5 rounded-[12px] bg-muted/30 p-1">
          <motion.div
            layout
            className="relative z-20 flex h-8 items-center justify-between gap-1 rounded-[10px] bg-muted/60 p-0.5"
          >
            {[
              { id: "desktop", icon: LaptopIcon, hotkey: hotkeys.desktop },
              { id: "tablet", icon: Tablet01Icon, hotkey: hotkeys.tablet },
              { id: "mobile", icon: SmartPhone01Icon, hotkey: hotkeys.mobile },
            ].map((mode) => {
              const Icon = mode.icon
              const isActive = viewportMode === mode.id
              return (
                <Tooltip key={mode.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "relative h-7 flex-1 rounded-[8px] transition-colors hover:bg-transparent",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => onViewportChange(mode.id as ViewportMode)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeViewport"
                          className="absolute inset-0 rounded-[8px] bg-background"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                      <HugeiconsIcon
                        icon={Icon}
                        className="relative z-10 size-3.5"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side={tooltipSide}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs capitalize">{mode.id}</span>
                    {mode.hotkey && (
                      <kbd className="rounded-[4px] border border-current/20 bg-current/10 px-1.5 py-0.5 text-[10px] font-medium uppercase opacity-80">
                        {mode.hotkey}
                      </kbd>
                    )}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </motion.div>

          <motion.div
            layout
            className="relative z-30 flex items-center gap-1.5"
          >
            <Select
              value={activeDemoIndex.toString()}
              onValueChange={(val) => setActiveDemoIndex(parseInt(val))}
            >
              <SelectTrigger
                className={cn(
                  "h-8 rounded-[10px] border-none bg-muted/60 text-xs font-medium focus:ring-0",
                  // ✨ BULLETPROOF WIDTH FIX: Fixed width + truncation prevents layout shifts.
                  // `[&>span]` targets the inner Radix text wrapper to ensure it clips properly.
                  "w-[130px] sm:w-[150px] [&>span]:truncate [&>span]:pr-2"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demos.map((demo, idx) => (
                  <SelectItem
                    key={demo.key}
                    value={idx.toString()}
                    className="text-xs"
                  >
                    {demo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasMoreActions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-[10px] bg-muted/60 transition-colors hover:bg-muted"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: chevronRotation }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className="size-3.5 text-muted-foreground"
                  />
                </motion.div>
              </Button>
            )}
          </motion.div>
        </div>

        {/* ACTIONS GRID BLOCK */}
        <motion.div
          layout
          className="relative z-10 flex flex-col gap-1 rounded-[12px] bg-muted/30 p-1"
        >
          <div
            className="relative z-20 grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            }}
          >
            {baseActions.map((a) => renderAction(a, false))}
          </div>

          <motion.div
            initial={false}
            animate={{
              height: isExpanded && hasMoreActions ? "auto" : 0,
              opacity: isExpanded && hasMoreActions ? 1 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
            }}
            className="relative z-10 overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{
                y:
                  isExpanded && hasMoreActions
                    ? 0
                    : isAnchoredBottom
                      ? 20
                      : -20,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              }}
            >
              {extraActions.map((a) => renderAction(a, !isExpanded))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
