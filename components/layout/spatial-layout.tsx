// components/layout/spatial-layout.tsx
"use client"

import { useEffect } from "react"
import { useSidebarStore } from "@/store/use-sidebar-store"
import type * as PageTree from "fumadocs-core/page-tree"
import { motion } from "motion/react"
import { SidebarContent } from "./sidebar-content"
import { cn } from "@/lib/utils"

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

      if (event.key.toLowerCase() === "m") {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    // The background acts as the "Frame" or "Shell" color
    <div className="relative h-screen w-full overflow-hidden bg-muted">
      {/* SIDEBAR: Behind the main content */}
      <div className="absolute inset-y-0 left-0 flex w-[320px] flex-col justify-center p-8">
        <SidebarContent tree={tree} />
      </div>

      {/* MAIN CONTENT: Slides and shrinks to reveal the sidebar/shell */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 320 : 0,
          scale: isOpen ? 0.95 : 1, // Shrinking gives the "inset padding" effect!
        }}
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.6,
        }}
        // origin-left ensures it scales away from the sidebar
        className="absolute h-full w-full origin-left overflow-hidden bg-background shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
        style={{
          borderRadius: isOpen ? "32px" : "0px", // Smoothly rounds the corners
        }}
      >
        {/* Toggle Button / Handle */}
        <button
          onClick={toggleSidebar}
          className="absolute top-20 left-0 z-20 flex h-24 w-11 items-center justify-center rounded-r-sm bg-foreground shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-colors hover:bg-foreground/80 focus-visible:outline-none"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar (M)"
        >
          <span className="rotate-180 text-[0.65rem] font-bold tracking-[0.2em] text-background uppercase [writing-mode:vertical-rl]">
            Menu
          </span>
        </button>

        {/* Scrollable Area (Main content width remains exactly the same inside!) */}
        <div className="relative no-scrollbar h-full w-full overflow-y-auto scroll-smooth">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
