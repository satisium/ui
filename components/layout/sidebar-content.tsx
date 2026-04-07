// components/layout/sidebar-content.tsx
"use client"

import type * as PageTree from "fumadocs-core/page-tree"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { useSidebarStore } from "@/store/use-sidebar-store"

// We create a custom type intersection to safely consume our injected badge
type CustomPageNode = PageTree.Item & { badge?: string }

export function SidebarContent({ tree }: { tree: PageTree.Root }) {
  return (
    <div className="flex h-full w-full flex-col pb-20 text-sidebar-primary-foreground">
      {/* Brand Header */}
      <div className="mb-12 flex items-center justify-between pl-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary-foreground/20 shadow-inner">
            <span className="text-xl">☺</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            emblemo UI
          </span>
        </div>
      </div>

      {/* Recursive Navigation Tree */}
      <div className="flex flex-col gap-0.5">
        {tree.children.map((node, i) => (
          <motion.div
            key={node.$id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1 + i * 0.05,
              type: "spring",
              stiffness: 350,
              damping: 30,
            }}
          >
            <TreeNode node={node} depth={0} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// --------------------------------------------------------
// RECURSIVE NODE RENDERER
// --------------------------------------------------------
function TreeNode({ node, depth }: { node: PageTree.Node; depth: number }) {
  const pathname = usePathname()
  const { closeSidebar } = useSidebarStore()

  // 1. SEPARATOR NODE (e.g., from meta.json "---")
  if (node.type === "separator") {
    return (
      <div className="my-6 pl-2">
        <div className="h-px w-full bg-sidebar-primary-foreground/10" />
        <span className="mt-3 block text-[0.65rem] font-bold tracking-widest text-sidebar-primary-foreground/40 uppercase">
          {node.name || "Overview"}
        </span>
      </div>
    )
  }

  // 2. PAGE NODE (The clickable links)
  if (node.type === "page") {
    // Exact match for active state
    const isActive = pathname === node.url

    // Cast the node to our custom type to access the injected badge securely
    const customNode = node as CustomPageNode
    const badgeText = customNode.badge

    return (
      <Link
        href={node.url}
        onClick={closeSidebar} // Seamless UX: Layout gracefully slides back on click
        className={`group relative flex items-center justify-between rounded-md px-3 py-2 transition-all duration-200 ease-out-expo ${
          isActive
            ? "bg-sidebar-primary-foreground/10 font-semibold text-sidebar-primary-foreground"
            : "font-medium text-sidebar-primary-foreground/60 hover:bg-sidebar-primary-foreground/5 hover:text-sidebar-primary-foreground"
        }`}
      >
        <span className="text-sm tracking-wide">{node.name}</span>

        {/* THE INJECTED MINIMAL BADGE */}
        {badgeText && (
          <span
            className={`ml-3 rounded px-1.5 py-0.5 text-[0.55rem] font-bold tracking-[0.1em] uppercase transition-colors duration-200 ${
              isActive
                ? "bg-primary/20 text-primary" // Vibrant glow if active
                : "bg-sidebar-primary-foreground/10 text-sidebar-primary-foreground/40 group-hover:bg-sidebar-primary-foreground/20 group-hover:text-sidebar-primary-foreground/80"
            }`}
          >
            {badgeText}
          </span>
        )}
      </Link>
    )
  }

  // 3. FOLDER NODE (The Nested Categories with "Ruler" styling)
  if (node.type === "folder") {
    return (
      <div className="mt-4 flex flex-col">
        {/* Folder Title */}
        <span className="mb-2 px-3 text-[0.7rem] font-bold tracking-wider text-sidebar-primary-foreground/50 uppercase">
          {node.name}
        </span>

        {/* The Nested "Ruler" Border Canvas */}
        <div className="relative ml-4 flex flex-col gap-0.5 pl-3">
          {/* The Mathematical Tick/Ruler Line */}
          <div
            className="absolute top-1 bottom-1 left-0 w-[1px] bg-sidebar-primary-foreground/10"
            style={{
              // Subtle tick marks via repeating gradient for that design-engineer feel
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 19px, rgba(255,255,255,0.15) 19px, rgba(255,255,255,0.15) 20px)",
            }}
          />

          {node.children.map((child) => (
            <TreeNode key={child.$id} node={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    )
  }

  return null
}
