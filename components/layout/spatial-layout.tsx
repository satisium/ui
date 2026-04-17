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

      if (event.key.toLowerCase() === "m") {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted">
      <div className="absolute inset-y-0 left-0 z-0 flex w-[320px] flex-col justify-center p-8">
        <SidebarContent tree={tree} />
      </div>

      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 320 : 0,
          scale: isOpen ? 0.95 : 1,
          borderRadius: isOpen ? 32 : 0,
        }}
        transition={{
          type: "spring",
          bounce: 0.1,
          duration: 0.6,
        }}
        className="absolute inset-0 z-10 origin-left overflow-hidden bg-background shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-20 left-0 z-20 flex h-24 w-11 items-center justify-center rounded-r-sm bg-foreground text-background shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-300 hover:w-14 hover:bg-primary focus-visible:outline-none dark:hover:text-foreground"
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar (M)"
        >
          <span className="rotate-180 text-[0.65rem] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
            Menu
          </span>
        </button>

        <div className="relative no-scrollbar h-full w-full overflow-y-auto scroll-smooth">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
