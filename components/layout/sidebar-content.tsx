"use client"

import type * as PageTree from "fumadocs-core/page-tree"
import { LayoutGroup, motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { SidebarFooter } from "./sidebar-footer"

/**
 * Extended Fumadocs PageTree Item to support custom metadata like badges.
 */
type CustomPageNode = PageTree.Item & { badge?: string }

/**
 * SidebarContent Component
 * Renders the main sidebar layout, including a scrollable navigation tree with
 * dynamic progressive blur overlays and a fixed footer.
 */
export function SidebarContent({ tree }: { tree: PageTree.Root }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Primitives used for scroll state to avoid React re-renders on every scroll tick.
  const [isScrolledTop, setIsScrolledTop] = useState(false)
  const [isScrolledBottom, setIsScrolledBottom] = useState(false)

  /**
   * Evaluates the scroll position of the navigation container to conditionally
   * display top/bottom progressive blur indicators.
   */
  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current

    setIsScrolledTop(scrollTop > 0)
    // -1px buffer accounts for high-DPI fractional pixel rounding discrepancies
    setIsScrolledBottom(Math.ceil(scrollTop + clientHeight) < scrollHeight - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // Initial check on mount
    checkScroll()

    // React to container resizes (e.g., window resize changing container height)
    const resizeObserver = new ResizeObserver(() => checkScroll())
    resizeObserver.observe(el)

    // React to layout animations (e.g., motion.div staggered loads changing content height)
    const mutationObserver = new MutationObserver(() => checkScroll())
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <div className="flex h-full w-full flex-col font-sans">
      {/* Header Section */}
      <div className="mb-6 flex-none items-center px-4 pt-2">
        <Link
          href="/"
          className="group flex w-full items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-muted focus-visible:outline-none"
        >
          <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors group-hover:border-primary/50">
            <span className="text-sm text-foreground">☺</span>
          </div>
          <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            SATIS UI
          </span>
        </Link>
      </div>

      {/* 
        Scrollable Navigation Wrapper 
        `min-h-0` is essential here to allow flex children to shrink and scroll properly 
      */}
      <div className="relative mb-2 flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Top Progressive Blur Overlay */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolledTop ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-24 rounded-2xl border bg-muted [mask-image:linear-gradient(to_bottom,black,transparent)] backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="pb-4[-ms-overflow-style:none] flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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

        {/* Bottom Progressive Blur Overlay */}
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolledBottom ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-24 rounded-2xl border bg-muted [mask-image:linear-gradient(to_top,black,transparent)] backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_top,black,transparent)]"
        />
      </div>

      {/* Fixed Footer: Theme Switcher, Social & Signature */}
      <SidebarFooter />
    </div>
  )
}

/**
 * TreeNode Component
 * Recursively renders the page tree. Handles categories (separators),
 * standard pages, and folders (both interactive and static).
 */
function TreeNode({ node, depth }: { node: PageTree.Node; depth: number }) {
  const pathname = usePathname()

  // 1. Render Separators (Section Headers)
  if (node.type === "separator") {
    return (
      <div className="mt-6 mb-2 px-3">
        <span className="text-[11px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
          {node.name}
        </span>
      </div>
    )
  }

  // 2. Render Standard Pages
  if (node.type === "page") {
    const isActive = pathname === node.url
    const customNode = node as CustomPageNode
    const badgeText = customNode.badge

    return (
      <Link
        href={node.url}
        aria-current={isActive ? "page" : undefined}
        className="group relative flex items-center justify-between gap-3 rounded-md px-3 py-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
      >
        {/* Active State Background Indicator (Shared LayoutID for seamless animation) */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute -inset-1 rounded-sm bg-foreground drop-shadow-2xl"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        {/* Hover Background Indicator */}
        {!isActive && (
          <div className="absolute -inset-0.5 -z-10 rounded-md transition-colors group-hover:bg-background" />
        )}

        {/* Content */}
        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5">
          {node.icon && (
            <span
              className={`flex flex-shrink-0 items-center justify-center transition-colors [&_svg]:size-4 ${
                isActive
                  ? "text-background"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {node.icon}
            </span>
          )}
          <span
            className={`truncate text-[13px] transition-colors ${
              isActive
                ? "font-medium text-background"
                : "font-medium text-muted-foreground group-hover:text-foreground"
            }`}
          >
            {node.name}
          </span>
        </div>

        {/* Optional Custom Badge */}
        {badgeText && (
          <span
            className={`relative z-10 ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors ${
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

  // 3. Render Folders
  if (node.type === "folder") {
    // If a folder has an index.mdx, Fumadocs attaches it to `node.index`
    const indexPage = node.index as CustomPageNode | undefined
    const isIndexActive = indexPage ? pathname === indexPage.url : false

    return (
      <div className="mt-3 flex flex-col">
        {indexPage ? (
          /* Render interactive folder link if an index.mdx page exists */
          <Link
            href={indexPage.url}
            aria-current={isIndexActive ? "page" : undefined}
            className="group relative flex items-center justify-between gap-3 rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          >
            {isIndexActive && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-sm bg-foreground drop-shadow-2xl"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            {!isIndexActive && (
              <div className="absolute inset-0 rounded-md transition-colors group-hover:bg-background" />
            )}

            <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
              {node.icon && (
                <span
                  className={`flex flex-shrink-0 transition-colors [&_svg]:size-3.5 ${
                    isIndexActive
                      ? "text-background"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {node.icon}
                </span>
              )}
              <span
                className={`truncate text-[12px] font-semibold tracking-tight transition-colors ${
                  isIndexActive
                    ? "text-background"
                    : "text-foreground/80 group-hover:text-foreground"
                }`}
              >
                {node.name}
              </span>
            </div>

            {/* Badges for Folder Index Pages */}
            {indexPage.badge && (
              <span
                className={`relative z-10 ml-auto flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors ${
                  isIndexActive
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-transparent text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground"
                }`}
              >
                {indexPage.badge}
              </span>
            )}
          </Link>
        ) : (
          /* Render static structural header for folders without index.mdx */
          <div className="flex min-w-0 items-center gap-2 px-3 py-1.5">
            {node.icon && (
              <span className="flex-shrink-0 text-muted-foreground [&_svg]:size-3.5">
                {node.icon}
              </span>
            )}
            <span className="truncate text-[12px] font-semibold tracking-tight text-foreground/80">
              {node.name}
            </span>
          </div>
        )}

        {/* Render Folder Children */}
        <div className="relative mt-1 flex flex-col gap-0.5">
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
