"use client"

import { motion } from "motion/react"
import React, { useEffect, useRef, useState } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import {
  ComputerTerminal01Icon,
  LockPasswordIcon,
  Share04Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { CodeBlock } from "../code-block/code-block"
import { CodeFile } from "../code-block/types"
import { CommandBlock } from "../command-block"
import { PreviewToolBox } from "./preview-toolbox"
import { ResizablePlayground, ViewportMode } from "./resizable-playground"
import { PreviewBackground } from "./preview-background" // ✨ IMPORTED

export interface DemoData {
  key: string
  name: string
  type?: "react" | "video" | "image"
  renderMode?: "direct" | "iframe"
  embedUrl?: string
  component?: React.ReactNode
  files?: Record<string, CodeFile | string>
  installCommand?: string
  previewUrl?: string
  mediaUrl?: string
}

interface PreviewerProps {
  title: string
  demos: DemoData[]
  githubUrl?: string
  previewUrl?: string
  sourceCodeId?: string
  isPaid?: boolean
  gumroadUrl?: string
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) {
        setState(JSON.parse(stored))
      } else {
        setState(initialValue)
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e)
      setState(initialValue)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value
      setState(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (e) {
      console.error("Failed to write to localStorage", e)
    }
  }

  return [state, setValue] as const
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

export function ComponentPreviewer({
  title,
  demos,
  githubUrl,
  previewUrl,
  sourceCodeId,
  isPaid = false,
  gumroadUrl,
}: PreviewerProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const componentKey =
    title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "default"

  const [activeDemoIndex, setActiveDemoIndex] = usePersistentState<number>(
    `satisium-active-demo-${componentKey}`,
    0
  )

  const [isCodeOpen, setIsCodeOpen] = usePersistentState<boolean>(
    "satisium-code-open",
    false
  )
  const [previewWidth, setPreviewWidth] = usePersistentState<number | string>(
    "satisium-preview-width",
    "100%"
  )
  const [viewportMode, setViewportMode] = usePersistentState<ViewportMode>(
    "satisium-viewport-mode",
    "desktop"
  )
  const [reloadKey, setReloadKey] = useState<number>(0)

  useEffect(() => setMounted(true), [])

  const safeActiveDemoIndex =
    activeDemoIndex >= 0 && activeDemoIndex < demos.length ? activeDemoIndex : 0

  const activeDemo = demos[safeActiveDemoIndex] || demos[0]

  const handleViewportChange = (mode: ViewportMode) => {
    setViewportMode(mode)
    if (mode === "desktop") setPreviewWidth("100%")
    if (mode === "tablet") setPreviewWidth(768)
    if (mode === "mobile") setPreviewWidth(375)
  }

  const handleReload = () => {
    if (activeDemo.renderMode === "iframe") {
      const iframe = document.getElementById(
        `satisium-iframe-${activeDemo.key}`
      ) as HTMLIFrameElement

      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "SATIS_RELOAD_ANIMATION" },
          "*"
        )
      }
    } else {
      setReloadKey((prev) => prev + 1)
    }
  }

  const handleScrollToSource = () => {
    if (sourceCodeId) {
      const cleanId = sourceCodeId.replace(/^#/, "")
      const el = document.getElementById(cleanId)

      if (el) {
        window.history.pushState(null, "", `#${cleanId}`)
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  if (!mounted)
    return <div className="h-screen w-screen animate-pulse bg-muted" />
  if (!activeDemo) return null

  const activeType = activeDemo.type || "react"
  const isMediaDemo = activeType === "video" || activeType === "image"

  return (
    <TooltipProvider delayDuration={150}>
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-background p-3 text-foreground"
      >
        <div className="relative flex h-full w-full overflow-hidden rounded-3xl">
          <div className="pointer-events-auto absolute top-0 right-0 flex h-full w-full flex-col rounded-2xl rounded-l-3xl lg:w-[600px]">
            {isPaid || isMediaDemo ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-background shadow-xl">
                  <HugeiconsIcon
                    icon={LockPasswordIcon}
                    className="h-8 w-8 text-foreground"
                  />
                </div>
                <h3 className="mb-3 font-heading text-2xl font-bold tracking-tight text-foreground">
                  Pro Component
                </h3>
                <p className="mb-8 max-w-[280px] text-[15px] leading-relaxed text-muted-foreground">
                  Unlock this component and the entire Satisium UI library with the
                  Pro Pack.
                </p>
                <a
                  href={gumroadUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_8px_rgba(var(--primary),0.3)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                    Unlock with Pro
                    <HugeiconsIcon
                      icon={Share04Icon}
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </a>
              </div>
            ) : (
              <div
                key={activeDemo.key}
                className="flex h-full flex-col gap-3 overflow-hidden px-3 pt-3"
              >
                <div className="mb-1 flex flex-col gap-1.5 px-1 pt-2">
                  <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-foreground">
                    <HugeiconsIcon
                      icon={ComputerTerminal01Icon}
                      className="size-4 text-muted-foreground"
                    />
                    <span>Installation</span>
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Run the command below to add the{" "}
                    <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {activeDemo.name}
                    </span>{" "}
                    demo to your project.
                  </p>
                </div>
                <CommandBlock command={activeDemo.installCommand || ""} />
                <CodeBlock
                  files={activeDemo.files || {}}
                  className="min-h-0 flex-1"
                />
              </div>
            )}
          </div>

          <motion.div
            className="absolute top-0 left-0 z-10 flex h-full overflow-hidden rounded-xl border-8 border-muted bg-muted shadow-[inset_0_0_60px_rgba(0,0,0,0.1)]"
            initial={false}
            animate={{
              width: isCodeOpen && isDesktop ? "calc(100% - 600px)" : "100%",
              x: isCodeOpen && !isDesktop ? "-100%" : "0%",
              opacity: isCodeOpen && !isDesktop ? 0 : 1,
            }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            {/* ✨ NEW COMPONENT HERE ✨ */}
            <PreviewBackground />

            {activeType === "video" && activeDemo.mediaUrl ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <video
                  src={activeDemo.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full rounded-2xl bg-background object-cover"
                />
              </div>
            ) : activeType === "image" && activeDemo.mediaUrl ? (
              <div className="relative flex h-full w-full items-center justify-center">
                <img
                  src={activeDemo.mediaUrl}
                  alt={activeDemo.name}
                  className="h-full w-full rounded-2xl bg-background object-cover"
                />
              </div>
            ) : (
              <ResizablePlayground
                demos={demos}
                activeDemoIndex={safeActiveDemoIndex}
                previewWidth={previewWidth}
                setPreviewWidth={setPreviewWidth}
                setViewportMode={setViewportMode}
                reloadKey={reloadKey}
              />
            )}
          </motion.div>

          <PreviewToolBox
            demos={demos}
            activeDemoIndex={safeActiveDemoIndex}
            setActiveDemoIndex={setActiveDemoIndex}
            isCodeOpen={isCodeOpen}
            setIsCodeOpen={setIsCodeOpen}
            viewportMode={viewportMode}
            onViewportChange={handleViewportChange}
            onReload={handleReload}
            onScrollToSource={handleScrollToSource}
            githubUrl={githubUrl}
            previewUrl={activeDemo.previewUrl || previewUrl}
            hasSourceCodeId={!!sourceCodeId}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
