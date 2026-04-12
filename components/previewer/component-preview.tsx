"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, useMotionValue } from "motion/react"
import {
  Code2,
  Terminal,
  Copy,
  Check,
  GripHorizontal,
  GripVertical,
  GitBranch,
  ExternalLink,
  ChevronsLeftRight,
} from "lucide-react"

// --- SHADCN COMPONENTS ---
import { Button } from "@/components/ui/button"
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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface DemoData {
  key: string
  name: string
  component: React.ReactNode
  rawString: string
  installCommand: string
}

type Orientation = "horizontal" | "vertical"

interface PreviewerProps {
  title: string
  demos: DemoData[]
  githubUrl?: string
  previewUrl?: string
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
  const [orientation, setOrientation] = usePersistentState<Orientation>(
    "satis-toolbar-ori",
    "horizontal"
  )

  useEffect(() => setMounted(true), [])

  const activeDemo = demos[activeDemoIndex] || demos[0]

  // Prevent hydration flash by not rendering complex UI until client mounts
  if (!mounted) return <div className="h-screen w-screen bg-muted/20" />

  return (
    <TooltipProvider delayDuration={150}>
      {/* =========================================================
          LAYER 1: THE BROWN LAYER (The Padded Wrapper)
          This flex-col setup creates the padding and holds the title
      ========================================================= */}
      <div
        ref={containerRef}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-background p-3 text-foreground"
      >
        {/* WORKSPACE BOUNDING BOX (Holds Blue & Code) */}
        <div className="relative flex w-full flex-1 overflow-hidden rounded-2xl bg-background">
          {/* THE CODE PANEL (Right-anchored, revealed when blue shrinks) */}
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

          {/* =========================================================
              LAYER 2: THE BLUE CURTAIN
              Shrinks strictly horizontally to reveal code.
          ========================================================= */}
          <motion.div
            className="absolute top-0 left-0 z-10 h-full overflow-hidden rounded-3xl border-8 border-border bg-background"
            initial={false}
            animate={{ width: isCodeOpen ? "calc(100% - 40%)" : "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          >
            {/* Dotted Background strictly inside the blue layer */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#414146_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-50" />

            {/* =========================================================
                LAYER 3: THE GREEN PLAYGROUND
                100% width by default, clamped to parent, left-anchored.
            ========================================================= */}
            <ResizablePlayground
              demos={demos}
              activeDemoIndex={activeDemoIndex}
              setActiveDemoIndex={setActiveDemoIndex}
            />
          </motion.div>
        </div>

        {/* =========================================================
            LAYER 4: FLOATING TOOLBAR
        ========================================================= */}
        <FloatingToolbar
          boundsRef={containerRef}
          orientation={orientation}
          setOrientation={setOrientation}
          isCodeOpen={isCodeOpen}
          setIsCodeOpen={setIsCodeOpen}
          githubUrl={githubUrl}
          previewUrl={previewUrl}
        />
      </div>
    </TooltipProvider>
  )
}

// --- SUB-COMPONENT: GREEN PLAYGROUND ---
function ResizablePlayground({
  demos,
  activeDemoIndex,
  setActiveDemoIndex,
}: {
  demos: DemoData[]
  activeDemoIndex: number
  setActiveDemoIndex: (v: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | string>("100%")
  const [isDragging, setIsDragging] = useState(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = "col-resize"
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      // Calculate width strictly based on mouse distance from the left edge of the container
      const newWidth = Math.max(320, e.clientX - containerRect.left)
      setWidth(newWidth)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      document.body.style.cursor = "default"
    }

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging])

  return (
    <div className="pointer-events-none absolute inset-0" ref={containerRef}>
      {/* 
        max-w-full ensures it NEVER bleeds out of the Blue layer 
        if the blue layer shrinks while this is dragged wide.
      */}
      <motion.div
        animate={{ width }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: isDragging ? 0 : 0.3,
        }}
        className="pointer-events-auto relative h-full max-w-full rounded-2xl bg-muted backdrop-blur-sm"
      >
        {/* Component Stage */}
        <div className="flex h-full w-full items-center justify-center overflow-auto p-8">
          {demos[activeDemoIndex]?.component}
        </div>

        {/* Separated Dropdown Selector (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-50">
          <Select
            value={activeDemoIndex.toString()}
            onValueChange={(val) => setActiveDemoIndex(parseInt(val))}
          >
            <SelectTrigger className="h-10 w-[180px] rounded-lg border-border bg-background/90 shadow-md backdrop-blur-md">
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
        </div>

        {/* Right-Edge Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          className="group absolute top-0 right-0 z-50 flex h-full w-4 -translate-x-[50%] cursor-col-resize items-center justify-center transition-colors group-hover:bg-muted/50"
        >
          <div
            className={`h-[40%] w-1.5 rounded-full shadow-sm transition-colors ${isDragging ? "bg-foreground" : "bg-foreground/50 group-hover:bg-foreground/70"}`}
          >
            <ChevronsLeftRight className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-background opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// --- SUB-COMPONENT: FLOATING TOOLBAR ---
interface ToolbarProps {
  boundsRef: React.RefObject<HTMLDivElement | null>
  orientation: Orientation
  setOrientation: (o: Orientation) => void
  isCodeOpen: boolean
  setIsCodeOpen: (v: boolean) => void
  githubUrl?: string
  previewUrl?: string
}

function FloatingToolbar({
  boundsRef,
  orientation,
  setOrientation,
  isCodeOpen,
  setIsCodeOpen,
  githubUrl,
  previewUrl,
}: ToolbarProps) {
  // Safe initial position logic to avoid hydration mismatches
  const getInitialPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 }
    try {
      const stored = window.localStorage.getItem("satis-toolbar-pos")
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    // Default to bottom center
    return { x: window.innerWidth / 2 - 100, y: window.innerHeight - 120 }
  }

  const [initialPos] = useState(getInitialPos)
  const x = useMotionValue(initialPos.x)
  const y = useMotionValue(initialPos.y)

  const isVert = orientation === "vertical"

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={boundsRef}
      style={{ x, y }}
      onDragEnd={() => {
        window.localStorage.setItem(
          "satis-toolbar-pos",
          JSON.stringify({ x: x.get(), y: y.get() })
        )
      }}
      className="absolute z-100 flex"
    >
      <motion.div
        layout
        className={`flex ${isVert ? "flex-col" : "flex-row"} items-center gap-1.5 rounded-sm border border-border bg-background/80 p-0.5 drop-shadow-2xl backdrop-blur-xl`}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      >
        <div className="cursor-grab p-2 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing">
          <GripHorizontal
            className={`h-5 w-5 opacity-60 ${isVert ? "" : "rotate-90"}`}
          />
        </div>

        <Separator
          orientation={isVert ? "horizontal" : "vertical"}
          className={isVert ? "h-px w-6" : "h-6 w-px"}
        />

        <div className={`flex ${isVert ? "flex-col" : "flex-row"} gap-1 p-0.5`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCodeOpen ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsCodeOpen(!isCodeOpen)}
              >
                <Code2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isVert ? "right" : "top"}>
              Toggle Code
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() =>
                  setOrientation(isVert ? "horizontal" : "vertical")
                }
              >
                {isVert ? (
                  <GripHorizontal className="h-4 w-4" />
                ) : (
                  <GripVertical className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isVert ? "right" : "top"}>
              Change Orientation
            </TooltipContent>
          </Tooltip>

          {githubUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  asChild
                >
                  <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <GitBranch className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isVert ? "right" : "top"}>
                GitHub
              </TooltipContent>
            </Tooltip>
          )}

          {previewUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg"
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
              <TooltipContent side={isVert ? "right" : "top"}>
                Open Isolated
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- UTILITY COMPONENT ---
function CodeSnippet({
  text,
  isSingleLine = false,
}: {
  text: string
  isSingleLine?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-background">
      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-background shadow-sm"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono text-xs text-muted-foreground sm:text-sm ${isSingleLine ? "whitespace-nowrap" : "whitespace-pre-wrap"}`}
      >
        <code>{text}</code>
      </pre>
    </div>
  )
}
