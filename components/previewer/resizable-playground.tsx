import { ChevronsLeftRight } from "lucide-react"
import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { DemoData } from "./component-preview"

export type ViewportMode = "desktop" | "tablet" | "mobile" | "custom"

interface PlaygroundProps {
  demos: DemoData[]
  activeDemoIndex: number
  previewWidth: number | string
  setPreviewWidth: (w: number | string) => void
  setViewportMode: (mode: ViewportMode) => void
  reloadKey: number
}

export function ResizablePlayground({
  demos,
  activeDemoIndex,
  previewWidth,
  setPreviewWidth,
  setViewportMode,
  reloadKey,
}: PlaygroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
      const newWidth = Math.max(320, e.clientX - containerRect.left)
      setPreviewWidth(newWidth)
      setViewportMode("custom") // Reverts toolbar toggle states to 'off'
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
  }, [isDragging, setPreviewWidth, setViewportMode])

  return (
    <div
      className="pointer-events-none absolute inset-0 flex"
      ref={containerRef}
    >
      <motion.div
        initial={false} // <-- THE FIX: Disables the mount animation jump
        animate={{ width: previewWidth }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: isDragging ? 0 : 0.4,
        }}
        className="pointer-events-auto relative flex h-full max-w-full flex-col overflow-hidden rounded-3xl border-r border-border bg-background"
      >
        {/* Component Stage bound to reloadKey to force remount */}
        <div
          key={reloadKey}
          className="flex h-full w-full items-center justify-center overflow-auto p-8 pb-20"
        >
          {demos[activeDemoIndex]?.component}
        </div>

        {/* Right-Edge Drag Handle */}
        <div
          onPointerDown={handlePointerDown}
          className="group absolute top-0 right-0 z-50 flex h-full w-4 -translate-x-[50%] cursor-col-resize items-center justify-center transition-colors group-hover:bg-muted/50"
        >
          <div
            className={`flex h-[40%] w-1.5 items-center justify-center rounded-full shadow-sm transition-colors ${
              isDragging
                ? "bg-foreground"
                : "bg-foreground/20 group-hover:bg-foreground/50"
            }`}
          >
            <ChevronsLeftRight className="h-3 w-3 text-background opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
