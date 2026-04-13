"use client"

import { Code2, Terminal } from "lucide-react"
import { motion } from "motion/react"
import React, { useEffect, useRef, useState } from "react"

// --- SHADCN COMPONENTS ---
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CodeSnippet } from "./code-snippet"
import { ResizablePlayground, ViewportMode } from "./resizable-playground"
import { PreviewToolbar } from "./preview-toolbar"

export interface DemoData {
  key: string
  name: string
  component: React.ReactNode
  rawString: string
  installCommand: string
}

interface PreviewerProps {
  title: string
  demos: DemoData[]
  githubUrl?: string
  previewUrl?: string
  /** The DOM ID of the source code section in your MDX (e.g., "source-code") */
  sourceCodeId?: string
}

// --- BULLETPROOF LOCAL STORAGE HOOK ---
function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored) setState(JSON.parse(stored))
    } catch (e) {
      console.error(e)
    }
  }, [key])

  const setValue = (value: T) => {
    setState(value)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value))
    }
  }

  return [state, setValue] as const
}

// --- MAIN EXPORTED COMPONENT ---
export function ComponentPreviewer({
  title,
  demos,
  githubUrl,
  previewUrl,
  sourceCodeId,
}: PreviewerProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Persistent States
  const [activeDemoIndex, setActiveDemoIndex] = usePersistentState<number>(
    "satis-active-demo",
    0
  )
  const [isCodeOpen, setIsCodeOpen] = usePersistentState<boolean>(
    "satis-code-open",
    false
  )

  // New States for requested features
  const [previewWidth, setPreviewWidth] = useState<number | string>("100%")
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop")
  const [reloadKey, setReloadKey] = useState<number>(0)

  useEffect(() => setMounted(true), [])

  const activeDemo = demos[activeDemoIndex] || demos[0]

  const handleViewportChange = (mode: "desktop" | "tablet" | "mobile") => {
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
        // Offset for sticky headers if necessary
        const y = el.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }
  }

  // Prevent hydration flash
  if (!mounted) return <div className="h-screen w-screen bg-muted/20" />

  return (
    <TooltipProvider delayDuration={150}>
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-background p-3 text-foreground"
      >
        <div className="relative flex w-full flex-1 rounded-3xl border-8 border-muted bg-muted">
          {/* THE CODE PANEL */}
          <div className="pointer-events-auto absolute top-0 right-0 flex h-full w-full flex-col md:w-[40%]">
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-6 pb-20">
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Terminal className="h-4 w-4" /> CLI Install
                  </h3>
                  <CodeSnippet text={activeDemo.installCommand} isSingleLine />
                </div>
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Code2 className="h-4 w-4" /> Usage Code
                  </h3>
                  <CodeSnippet text={activeDemo.rawString} />
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* LAYER 2: THE BLUE CURTAIN */}
          <motion.div
            className="absolute top-0 left-0 z-10 flex h-full overflow-hidden rounded-xl bg-background"
            initial={false}
            animate={{ width: isCodeOpen ? "calc(100% - 40%)" : "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#414146_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-50" />

            {/* LAYER 3: THE GREEN PLAYGROUND */}
            <ResizablePlayground
              demos={demos}
              activeDemoIndex={activeDemoIndex}
              previewWidth={previewWidth}
              setPreviewWidth={setPreviewWidth}
              setViewportMode={setViewportMode}
              reloadKey={reloadKey}
            />
          </motion.div>

          {/* LAYER 4: STATIC COMBINED TOOLBAR */}
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
