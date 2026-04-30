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
  File02Icon,
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

import { ViewportMode } from "./resizable-playground"
import { DemoData } from "./component-preview"

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
  gridCols = 2,
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
      icon: <HugeiconsIcon icon={Refresh03Icon} className="size-3.5" />,
      label: "Reload Animation",
      hotkey: hotkeys.reload?.toUpperCase(),
      onClick: onReload,
      show: true,
      active: false,
    },
    {
      id: "code",
      icon: <HugeiconsIcon icon={SourceCodeIcon} className="size-3.5" />,
      label: "Toggle Code",
      hotkey: hotkeys.code?.toUpperCase(),
      onClick: () => setIsCodeOpen(!isCodeOpen),
      show: true,
      active: isCodeOpen,
    },
    {
      id: "scroll",
      icon: <HugeiconsIcon icon={File02Icon} className="size-3.5" />,
      label: "Scroll to Source",
      hotkey: hotkeys.scroll?.toUpperCase(),
      onClick: onScrollToSource,
      show: hasSourceCodeId,
      active: false,
    },
    {
      id: "github",
      icon: <HugeiconsIcon icon={GithubIcon} className="size-3.5" />,
      label: "View GitHub",
      onClick: () => window.open(githubUrl, "_blank", "noopener,noreferrer"),
      show: !!githubUrl,
      active: false,
    },
    {
      id: "preview",
      icon: <HugeiconsIcon icon={Share04Icon} className="size-3.5" />,
      label: "Open Isolated",
      onClick: () => window.open(previewUrl, "_blank", "noopener,noreferrer"),
      show: !!previewUrl,
      active: false,
    },
  ].filter((a) => a.show)

  const isAnchoredBottom = anchor.startsWith("bottom")
  const tooltipSide = isAnchoredBottom ? "top" : "bottom"
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
            "h-9 w-full rounded-sm bg-muted transition-colors hover:bg-muted/50",
            action.active ? "bg-background shadow-sm hover:bg-background" : ""
          )}
          style={{ pointerEvents: isHidden ? "none" : "auto" }}
          onClick={action.onClick}
        >
          {action.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide} className="flex items-center gap-2">
        <span>{action.label}</span>
        {action.hotkey && (
          <kbd className="rounded-sm border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
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
        "absolute z-10 rounded-3xl border bg-muted p-2 drop-shadow-2xl",
        anchorClasses[anchor]
      )}
      style={{ transformOrigin: originClasses[anchor] }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className={cn("flex gap-2", flexDirClass)}>
        <div className="flex flex-col gap-2 rounded-2xl border bg-background p-2">
          <motion.div
            layout
            className="relative z-20 flex h-10 items-center justify-between gap-1 rounded-sm bg-muted p-1"
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
                        "relative h-8 flex-1 rounded-sm transition-colors hover:bg-transparent",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => onViewportChange(mode.id as ViewportMode)}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeViewport"
                          className="absolute inset-0 rounded-sm bg-background shadow-sm"
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
                    <span className="capitalize">{mode.id}</span>
                    {mode.hotkey && (
                      <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {mode.hotkey.toUpperCase()}
                      </kbd>
                    )}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </motion.div>
          <motion.div layout className="relative z-30 flex items-center gap-2">
            <Select
              value={activeDemoIndex.toString()}
              onValueChange={(val) => setActiveDemoIndex(parseInt(val))}
            >
              <SelectTrigger className="h-9 min-w-15 rounded-sm border-none bg-muted focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demos.map((demo, idx) => (
                  <SelectItem key={demo.key} value={idx.toString()}>
                    {demo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasMoreActions && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-sm bg-muted transition-colors hover:bg-muted/50"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: chevronRotation }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
                </motion.div>
              </Button>
            )}
          </motion.div>
        </div>

        <motion.div
          layout
          className="relative z-10 flex flex-col gap-1 rounded-2xl border bg-background p-2"
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
                      ? 40
                      : -40,
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
