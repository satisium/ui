// components/layout/sidebar-content.tsx
"use client"

import { motion } from "motion/react"

const links = ["Home", "Works", "Playground", "About", "Contact"]

export function SidebarContent() {
  return (
    <div className="flex h-full w-full flex-col text-sidebar-primary-foreground">
      {/* Theme Toggle Placeholder */}
      <div className="mb-12 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-sidebar-primary-foreground/20 transition-colors hover:bg-sidebar-primary-foreground/30">
        <span className="text-sm">◐</span>
      </div>

      {/* Ruler Navigation Menu */}
      <div className="relative pl-2">
        {/* The Vertical Ruler Line with Ticks */}
        <div
          className="absolute top-0 bottom-0 left-0 w-4 border-r border-sidebar-primary-foreground/20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 19px, rgba(255,255,255,0.2) 19px, rgba(255,255,255,0.2) 20px)",
          }}
        />

        <nav className="flex flex-col gap-6 pl-8">
          {links.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.1 + i * 0.05,
                type: "spring",
                stiffness: 300,
              }}
              className="group relative cursor-pointer font-medium tracking-wide text-sidebar-primary-foreground/70 transition-colors hover:text-sidebar-primary-foreground"
            >
              {item}
            </motion.div>
          ))}
        </nav>
      </div>
    </div>
  )
}
