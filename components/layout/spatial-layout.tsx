"use client"

import { useSidebarStore } from "@/store/use-sidebar-store"
import type * as PageTree from "fumadocs-core/page-tree"
import { motion } from "motion/react"
import { useEffect } from "react"
import { SidebarContent } from "./sidebar-content"

export function SpatialLayout({
  children,
  tree,
}: {
  children: React.ReactNode
  tree: PageTree.Root
}) {
  const { isOpen, toggleSidebar } = useSidebarStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      const activeElement = document.activeElement as HTMLElement | null
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable
      ) {
        return
      }

      if (event.key.toLowerCase() === "m" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted">
      {/* Sidebar background underlayer */}
      <div className="absolute inset-y-0 left-0 z-0 flex w-[320px] flex-col px-6 py-8">
        <SidebarContent tree={tree} />
      </div>

      {/* Main Card Wrapper (Pure GPU transform) */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 320 : 0,
          scale: isOpen ? 0.95 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 380,
          damping: 38,
          mass: 0.8,
        }}
        style={{ willChange: "transform" }}
        data-sidebar-open={isOpen}
        className="group/spatial absolute inset-0 z-10 origin-left p-2"
      >
        {/* ✨ Decoupled Drop Shadow Layer: Appears ONLY when sidebar opens, vanishes immediately on close */}
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: isOpen ? 0.25 : 0.15,
            delay: isOpen ? 0.25 : 0, // Waits until the card has nearly settled
            ease: "easeOut",
          }}
          className="pointer-events-none absolute inset-0 rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        />

        {/* Main Card Surface with constant rounded-[32px] and clean clipping */}
        <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-background">
          <button
            onClick={toggleSidebar}
            className="absolute top-20 left-0 z-50 flex h-24 w-11 items-center justify-center rounded-r-sm bg-foreground text-background shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:w-14 hover:bg-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:text-foreground"
            aria-label="Toggle Sidebar"
            title="Toggle Sidebar (M)"
          >
            <span className="rotate-180 text-[0.65rem] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
              Menu
            </span>
          </button>

          {/* Event Capture + Preserved Scrolling */}
          <div
            className={`relative no-scrollbar h-full w-full overflow-y-auto scroll-smooth ${
              isOpen ? "cursor-pointer" : ""
            }`}
            onClickCapture={(e) => {
              if (isOpen) {
                e.preventDefault()
                e.stopPropagation()
                toggleSidebar()
              }
            }}
          >
            <div className={isOpen ? "pointer-events-none select-none" : ""}>
              {children}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
