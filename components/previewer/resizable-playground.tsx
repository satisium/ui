"use client"

import { ChevronDoubleCloseIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { DemoData } from "./component-preview"
import { cn } from "@/lib/utils" // ✨ IMPORTED cn util

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
      setViewportMode("custom")
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

  const activeDemo = demos[activeDemoIndex]
  const isIframe = activeDemo?.renderMode === "iframe"

  return (
    <div
      className="pointer-events-none absolute inset-0 flex"
      ref={containerRef}
    >
      <motion.div
        initial={false}
        animate={{ width: previewWidth }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: isDragging ? 0 : 0.4,
        }}
        className="pointer-events-auto relative flex h-full max-w-full flex-col overflow-hidden rounded-2xl bg-background drop-shadow-2xl"
      >
        <div
          key={isIframe ? "iframe-wrapper" : reloadKey}
          className={cn(
            "flex h-full w-full items-center justify-center overflow-auto",
            isIframe ? "p-0" : "p-8 pb-20",
            // Only lock the parent wrapper if dragging a direct React render
            isDragging && !isIframe && "pointer-events-none select-none"
          )}
        >
          {isIframe && activeDemo.embedUrl ? (
            <iframe
              id={`satis-iframe-${activeDemo.key}`}
              src={activeDemo.embedUrl}
              title={activeDemo.name}
              loading="lazy"
              className={cn(
                "h-full w-full border-none bg-transparent",
                // ✨ 1. Disable when dragging so it doesn't steal the cursor mid-drag
                isDragging && "pointer-events-none select-none",
                // ✨ 2. Disable when the spatial layout sidebar is open
                "group-data-[sidebar-open=true]/spatial:pointer-events-none"
              )}
            />
          ) : (
            activeDemo?.component
          )}
        </div>

        <div
          onPointerDown={handlePointerDown}
          className="group absolute top-0 right-0 z-50 flex h-full w-4 -translate-x-[50%] cursor-col-resize items-center justify-center transition-colors"
        >
          <div
            className={`flex h-[40%] w-1.5 items-center justify-center rounded-full shadow-sm transition-colors ${
              isDragging
                ? "bg-foreground"
                : "bg-foreground/20 group-hover:bg-foreground/50"
            }`}
          >
            <HugeiconsIcon
              icon={ChevronDoubleCloseIcon}
              className="size-3.5 text-background opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
