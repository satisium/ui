// components/layout/spatial-layout.tsx
"use client"

import { motion } from "motion/react"
import { useSidebarStore } from "@/store/use-sidebar-store"
import { GridPattern } from "./grid-pattern"
import { SidebarContent } from "./sidebar-content"

export function SpatialLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, toggleSidebar } = useSidebarStore()

  return (
    // The outer shell holds the fixed Sidebar color
    <div className="relative h-screen w-full overflow-hidden bg-sidebar-primary">
      {/* BOTTOM LAYER: The Fixed Sidebar */}
      <div className="absolute top-0 left-0 h-full w-[30%] p-6 lg:p-8">
        <SidebarContent />
      </div>

      {/* TOP LAYER: The Sliding Main Content */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 280 : 0,
          // Subtle rounding on the left edge when pushed, flat when closed
          borderTopLeftRadius: isOpen ? 24 : 0,
          borderBottomLeftRadius: isOpen ? 24 : 0,
        }}
        transition={{
          type: "spring",
          bounce: 0, // No bounce, creates that heavy, solid feeling
          duration: 0.6,
        }}
        className="absolute inset-0 z-10 h-full w-full bg-background shadow-[-35px_0_80px_rgba(0,0,0,0.1)] outline outline-border/50"
      >
        <GridPattern />

        {/* 
          The Tactile Handle (MENU Tab) 
          Positioned fixed relative to the sliding div, so it never scrolls out of view.
        */}
        <button
          onClick={toggleSidebar}
          className="absolute top-20 left-0 z-20 flex h-24 w-11 items-center justify-center rounded-r-xl border-y border-r border-border bg-background shadow-[4px_0_12px_rgba(0,0,0,0.03)] transition-colors hover:bg-muted/50 focus-visible:outline-none"
          aria-label="Toggle Sidebar"
        >
          <span className="rotate-180 text-[0.65rem] font-medium tracking-[0.2em] text-muted-foreground uppercase [writing-mode:vertical-rl]">
            Menu
          </span>
        </button>

        {/* 
          The Scrollable Content Area 
          Because the parent is 100vw, translating the parent right means 
          this area never changes width. No squeezing. 
        */}
        <div className="relative z-10 no-scrollbar h-full w-full overflow-y-auto">
          {/* pl-20 prevents content from hiding under the fixed handle */}
          <div className="mx-auto max-w-4xl px-8 py-24 pl-20 md:px-16 md:pl-24 lg:py-32">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
