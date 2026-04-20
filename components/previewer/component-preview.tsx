"use client"

import { motion } from "motion/react"
import React, { useEffect, useRef, useState } from "react"

import { TooltipProvider } from "@/components/ui/tooltip"
import { CodeBlock } from "../code-block/code-block"
import { CodeFile } from "../code-block/types"
import { CommandBlock } from "../command-block"
import { PreviewToolbar } from "./preview-toolbar"
import { ResizablePlayground, ViewportMode } from "./resizable-playground"
import { Terminal } from "lucide-react"

export interface DemoData {
  key: string
  name: string
  component: React.ReactNode
  files: Record<string, CodeFile | string>
  installCommand: string
}

interface PreviewerProps {
  title: string
  demos: DemoData[]
  githubUrl?: string
  previewUrl?: string
  sourceCodeId?: string
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) setState(JSON.parse(stored))
    } catch (e) {
      console.error("Failed to read from localStorage", e)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
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
  demos,
  githubUrl,
  previewUrl,
  sourceCodeId,
}: PreviewerProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const [activeDemoIndex, setActiveDemoIndex] = usePersistentState<number>(
    "satis-active-demo",
    0
  )
  const [isCodeOpen, setIsCodeOpen] = usePersistentState<boolean>(
    "satis-code-open",
    false
  )

  // Use persistent state for both width and viewport mode
  const [previewWidth, setPreviewWidth] = usePersistentState<number | string>(
    "satis-preview-width",
    "100%"
  )
  const [viewportMode, setViewportMode] = usePersistentState<ViewportMode>(
    "satis-viewport-mode",
    "desktop"
  )
  const [reloadKey, setReloadKey] = useState<number>(0)

  useEffect(() => setMounted(true), [])

  const activeDemo = demos[activeDemoIndex] || demos[0]

  const handleViewportChange = (mode: ViewportMode) => {
    setViewportMode(mode)
    if (mode === "desktop") setPreviewWidth("100%")
    if (mode === "tablet") setPreviewWidth(768)
    if (mode === "mobile") setPreviewWidth(375)
  }

  const handleReload = () => setReloadKey((prev) => prev + 1)

  const handleScrollToSource = () => {
    if (sourceCodeId) {
      const el = document.getElementById(sourceCodeId)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }
  }

  if (!mounted)
    return <div className="h-screen w-screen animate-pulse bg-muted" />

  if (!activeDemo) return null

  return (
    <TooltipProvider delayDuration={150}>
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-background p-3 text-foreground"
      >
        <div className="relative flex h-full w-full overflow-hidden rounded-3xl">
          <div className="pointer-events-auto absolute top-0 right-0 flex h-full w-full flex-col rounded-2xl rounded-l-3xl lg:w-[600px]">
            <div
              key={activeDemo.key}
              className="flex h-full flex-col gap-3 overflow-hidden px-3 pt-3"
            >
              <div className="mb-1 flex flex-col gap-1.5 px-1 pt-2">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-foreground">
                  <Terminal className="size-4 text-muted-foreground" />
                  <span>Installation</span>
                </h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  Run the command below to add the{" "}
                  <span className="inline-flex items-center rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-foreground">
                    {activeDemo.name}
                  </span>{" "}
                  demo to your project. Switch variants via the bottom toolbar.
                </p>
              </div>
              <CommandBlock cli={activeDemo.installCommand} />
              <CodeBlock files={activeDemo.files} className="min-h-0 flex-1" />
            </div>
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
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#414146_1.5px,transparent_1.5px)] bg-size-[24px_24px] opacity-50 dark:opacity-50" />

            <ResizablePlayground
              demos={demos}
              activeDemoIndex={activeDemoIndex}
              previewWidth={previewWidth}
              setPreviewWidth={setPreviewWidth}
              setViewportMode={setViewportMode}
              reloadKey={reloadKey}
            />
          </motion.div>

          <PreviewToolbar
            demos={demos}
            activeDemoIndex={activeDemoIndex}
            setActiveDemoIndex={setActiveDemoIndex}
            isCodeOpen={isCodeOpen}
            setIsCodeOpen={setIsCodeOpen}
            viewportMode={viewportMode}
            onViewportChange={handleViewportChange}
            onReload={handleReload}
            onScrollToSource={handleScrollToSource}
            githubUrl={githubUrl}
            previewUrl={previewUrl}
            hasSourceCodeId={!!sourceCodeId}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
