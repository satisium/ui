"use client"

import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { motion } from "motion/react"
import Link from "next/link"

export type TOCItemType = {
  title: React.ReactNode
  url: string
  depth: number
}

export function TableOfContents({ items }: { items: TOCItemType[] }) {
  // Extract IDs from the urls (e.g., "#installation" -> "installation")
  const headingIds = items.map((item) => item.url.substring(1))
  const activeId = useScrollSpy(headingIds)

  if (!items || items.length === 0) return null

  return (
    <nav className="flex flex-col gap-4" aria-label="Table of Contents">
      <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
        On this page
      </span>

      {/* The Track */}
      <div className="relative flex flex-col gap-1 py-1 pl-6">
        {items.map((item) => {
          const isActive = activeId === item.url.substring(1)
          // Indent deeper headings (h3, h4) for visual hierarchy
          const indentClass =
            item.depth === 3 ? "ml-3" : item.depth === 4 ? "ml-6" : ""

          return (
            <Link
              key={item.url}
              href={item.url}
              className={`group relative py-1 transition-colors duration-200 ${indentClass} ${
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {/* THE KINETIC INDICATOR */}
              {isActive && (
                <motion.div
                  layoutId="toc-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-1/2 -left-16 h-0.5 w-13 -translate-y-1/2 rounded-full bg-primary ring-4 ring-background"
                />
              )}

              <span className="line-clamp-2 text-sm tracking-wide">
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
