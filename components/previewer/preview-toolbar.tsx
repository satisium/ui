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
  Code2,
  ExternalLink,
  FileText,
  GitBranch,
  Monitor,
  RefreshCcw,
  Smartphone,
  Tablet,
} from "lucide-react"
import { Button } from "../ui/button"
import { DemoData } from "./component-preview"
import { ViewportMode } from "./resizable-playground"
interface ToolbarProps {
  demos: DemoData[]
  activeDemoIndex: number
  setActiveDemoIndex: (val: number) => void
  isCodeOpen: boolean
  setIsCodeOpen: (v: boolean) => void
  viewportMode: ViewportMode
  onViewportChange: (mode: "desktop" | "tablet" | "mobile") => void
  onReload: () => void
  onScrollToSource: () => void
  githubUrl?: string
  previewUrl?: string
  hasSourceCodeId: boolean
}

export function PreviewToolbar({
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
}: ToolbarProps) {
  return (
    <div className="absolute bottom-4 left-4 z-50 sm:bottom-6 sm:left-6">
      <div className="flex flex-row items-center justify-center gap-2 rounded-sm bg-muted p-1 drop-shadow-2xl">
        <Select
          value={activeDemoIndex.toString()}
          onValueChange={(val) => setActiveDemoIndex(parseInt(val))}
        >
          <SelectTrigger className="h-9 w-32.5 rounded-sm border-none bg-background shadow-none hover:bg-muted focus:ring-0 sm:w-40">
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

        <div className="hidden h-9 items-center rounded-sm bg-background sm:flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewportMode === "desktop" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-sm"
                onClick={() => onViewportChange("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Desktop</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewportMode === "tablet" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-sm"
                onClick={() => onViewportChange("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Tablet</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewportMode === "mobile" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-sm"
                onClick={() => onViewportChange("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Mobile</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={onReload}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Reload Animation</TooltipContent>
          </Tooltip>

          {hasSourceCodeId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={onScrollToSource}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Scroll to Source</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size="icon"
                className={cn(
                  "rounded-sn h-9 w-9",
                  isCodeOpen ? "bg-background" : ""
                )}
                onClick={() => setIsCodeOpen(!isCodeOpen)}
              >
                <Code2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle Code</TooltipContent>
          </Tooltip>

          {githubUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 rounded-sm sm:inline-flex"
                  asChild
                >
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <GitBranch className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">View GitHub</TooltipContent>
            </Tooltip>
          )}

          {previewUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-9 w-9 rounded-sm sm:inline-flex"
                  asChild
                >
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Open Isolated</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
