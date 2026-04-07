// components/layout/sidebar-content.tsx
"use client"

import type * as PageTree from "fumadocs-core/page-tree"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Custom type for our injected metadata
type CustomPageNode = PageTree.Item & { badge?: string }

export function SidebarContent({ tree }: { tree: PageTree.Root }) {
  return (
    <div className="flex h-full w-full flex-col bg-background pb-20 text-foreground">
      {/* 
        Brand Header 
        Using a 1.125 gap multiplier for vertical rhythm. 
      */}
      <div className="mb-10 flex items-center justify-between pt-2 pl-2">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 shadow-sm transition-colors group-hover:border-primary/50">
            <span className="text-lg">☺</span>
          </div>
          <span className="font-display">SATIS UI </span>
        </Link>
      </div>

      {/* 
        Navigation Tree 
        gap-[4.5px] represents the 1.125 ratio (4px * 1.125)
      */}
      <nav className="flex flex-col gap-[4.5px] pr-4">
        {tree.children.map((node, i) => (
          <motion.div
            key={node.type === "separator" ? `sep-${i}` : node.$id || node.$id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: i * 0.04,
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          >
            <TreeNode node={node} depth={0} />
          </motion.div>
        ))}
      </nav>
    </div>
  )
}

// --------------------------------------------------------
// RECURSIVE NODE RENDERER
// --------------------------------------------------------
function TreeNode({ node, depth }: { node: PageTree.Node; depth: number }) {
  const pathname = usePathname()

  // 1. SEPARATOR (The Visual Break)
  if (node.type === "separator") {
    return (
      <div className="my-4 flex items-center px-2">
        <div className="h-[1px] w-full bg-border/60" />
      </div>
    )
  }

  // 2. PAGE NODE (The Nav Link)
  if (node.type === "page") {
    const isActive = pathname === node.url
    const customNode = node as CustomPageNode
    const badgeText = customNode.badge

    return (
      <Link
        href={node.url}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex items-center justify-between rounded-md px-3 py-1.5 transition-all duration-200 ${
          isActive
            ? "bg-secondary font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <span className="text-sm tracking-tight">{node.name}</span>

        {/* Minimalist Injected Badge */}
        {badgeText && (
          <span
            className={`ml-2 rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                : "border border-border bg-muted text-muted-foreground group-hover:border-muted-foreground/30"
            }`}
          >
            {badgeText}
          </span>
        )}
      </Link>
    )
  }

  // 3. FOLDER NODE (The Nested Category)
  if (node.type === "folder") {
    return (
      <div className="mt-4 flex flex-col gap-[4.5px]">
        {/* Category Header */}
        <span className="mb-1 pl-3 text-[10px] font-bold tracking-[0.15em] text-muted-foreground/60 uppercase">
          {node.name}
        </span>

        {/* Nested Content with the "Ruler" line */}
        <div className="relative ml-4 flex flex-col gap-[4.5px] pl-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.type === "page" ? child.url : child.$id}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    )
  }

  return null
}
