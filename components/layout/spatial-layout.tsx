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
      // 1. THE HOLD-DOWN GUARD
      // If the user is holding the key, ignore all subsequent auto-repeated events.
      if (event.repeat) {
        return
      }

      // 2. THE INPUT GUARD
      // Prevent triggering if the user is typing in an input field
      const activeElement = document.activeElement as HTMLElement | null
      if (
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.isContentEditable
      ) {
        return
      }

      // 3. THE EXECUTION
      if (event.key.toLowerCase() === "m") {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [toggleSidebar])

  return (
    // The outer shell holds the fixed Sidebar color
    <div className="relative h-screen w-full overflow-hidden bg-border">
      {/* BOTTOM LAYER: The Fixed Sidebar */}
      <div className="absolute top-0 left-0 h-full w-[50%] min-w-[280px] rounded-l-3xl border-8 bg-background p-6 lg:p-8">
        <SidebarContent tree={tree} />
      </div>

      {/* TOP LAYER: The Sliding Main Content */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 320 : 0,
        }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: 0.6,
        }}
        className={cn(
          "absolute inset-0 z-10 h-full w-full rounded-r-3xl border-8 bg-background shadow-[-35px_0_80px_rgba(0,0,0,0.1)]"
        )}
      >
        {/* The Tactile Handle (MENU Tab) 
          Z-20 ensures it floats gracefully over the edge-to-edge component previewer.
        */}
        <button
          onClick={toggleSidebar}
          className="absolute top-20 left-0 z-20 flex h-24 w-11 items-center justify-center rounded-r-xl border-y border-r border-border bg-background shadow-[4px_0_12px_rgba(0,0,0,0.03)] transition-colors hover:bg-muted/50 focus-visible:outline-none"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar (M)"
        >
          <span className="rotate-180 text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase [writing-mode:vertical-rl]">
            Menu
          </span>
        </button>

        {/* The Scrollable Content Area 
          REMOVED: max-w and paddings. This allows the page to bleed 100vw!
        */}
        <div className="relative z-10 no-scrollbar h-full w-full overflow-y-auto scroll-smooth">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
