"use client"

import type * as PageTree from "fumadocs-core/page-tree"
import { motion, LayoutGroup } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type CustomPageNode = PageTree.Item & { badge?: string }

export function SidebarContent({ tree }: { tree: PageTree.Root }) {
  return (
    <div className="flex h-full w-full flex-col pb-20 font-sans">
      <div className="mb-6 flex items-center px-4 pt-6">
        <Link
          href="/"
          className="group flex w-full items-center gap-3 outline-none"
        >
          <div className="flex size-7 items-center justify-center rounded-md border border-border bg-background shadow-sm transition-colors group-hover:border-primary/50">
            <span className="text-sm text-foreground">☺</span>
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-foreground">
            SATIS UI
          </span>
        </Link>
      </div>

      <LayoutGroup>
        <nav className="flex flex-col gap-1 px-2">
          {tree.children.map((node, i) => (
            <motion.div
              key={node.type === "separator" ? `sep-${i}` : node.$id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.03,
                type: "spring",
                stiffness: 400,
                damping: 30,
              }}
            >
              <TreeNode node={node} depth={0} />
            </motion.div>
          ))}
        </nav>
      </LayoutGroup>
    </div>
  )
}

function TreeNode({ node, depth }: { node: PageTree.Node; depth: number }) {
  const pathname = usePathname()

  if (node.type === "separator") {
    return (
      <div className="mt-6 mb-2 px-3">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
          {node.name}
        </span>
      </div>
    )
  }

  if (node.type === "page") {
    const isActive = pathname === node.url
    const customNode = node as CustomPageNode
    const badgeText = customNode.badge

    return (
      <Link
        href={node.url}
        aria-current={isActive ? "page" : undefined}
        className="group relative flex items-center justify-between rounded-md px-3 py-2 outline-none"
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute inset-0 rounded-md border border-border/50 bg-foreground shadow-sm"
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
            }}
          />
        )}

        {!isActive && (
          <div className="absolute inset-0 rounded-md transition-colors group-hover:bg-accent/50" />
        )}

        <div className="relative z-10 flex items-center gap-2.5">
          {node.icon && (
            <span
              className={`flex items-center justify-center transition-colors [&_svg]:size-4 ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {node.icon}
            </span>
          )}
          <span
            className={`text-[13px] transition-colors ${
              isActive
                ? "font-medium text-background"
                : "font-medium text-muted-foreground group-hover:text-foreground"
            }`}
          >
            {node.name}
          </span>
        </div>

        {badgeText && (
          <span
            className={`relative z-10 ml-2 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-transparent text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground"
            }`}
          >
            {badgeText}
          </span>
        )}
      </Link>
    )
  }

  if (node.type === "folder") {
    return (
      <div className="mt-3 flex flex-col">
        <div className="flex items-center gap-2 px-3 py-1.5">
          {node.icon && (
            <span className="text-muted-foreground [&_svg]:size-3.5">
              {node.icon}
            </span>
          )}
          <span className="text-[12px] font-semibold tracking-tight text-foreground/80">
            {node.name}
          </span>
        </div>

        <div className="relative mt-1 flex flex-col gap-0.5">
          <div className="absolute top-0 bottom-0 left-4.5 w-px bg-foreground/20" />

          <div className="ml-5 flex flex-col gap-0.5 pl-1">
            {node.children.map((child) => (
              <TreeNode
                key={child.type === "page" ? child.url : child.$id}
                node={child}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
