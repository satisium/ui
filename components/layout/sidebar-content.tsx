"use client"

import type * as PageTree from "fumadocs-core/page-tree"
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { FavouriteIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarFooter } from "./sidebar-footer"
import { CommandMenuTrigger } from "./command-menu"
import { source } from "@/lib/source"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import { useSignedCloudinaryUrl } from "@/lib/use-signed-cloudinary-url"
import { extractPublicId } from "@/lib/media-config"

// --- NEW IMPORTS ---
import { SatisiumLogo } from "@/components/satisium-logo"
import { Badge } from "@/components/ui/badge"

type CustomPageNode = PageTree.Item & {
  badge?: string
  media?: { video?: string; [key: string]: any }
}

/**
 * COMPONENT: The Pure Video Layer (Solid Physical Geometry)
 */
function VideoLayer({ url }: { url: string }) {
  const publicId = extractPublicId(url)
  const {
    url: signedVideo,
    poster: signedPoster,
    loading,
  } = useSignedCloudinaryUrl(
    publicId,
    "video",
    "t_satisium_preview,f_auto,q_auto:low,ac_none"
  )

  // Prefer signed URLs; fall back to getCloudinaryUrl while migrating
  const poster = signedPoster || getCloudinaryUrl(url, "preview", "image")
  const video = signedVideo || getCloudinaryUrl(url, "preview", "video")

  return (
    <div className="relative h-full w-full">
      {poster && !loading && (
        <img
          src={poster}
          alt="Component Preview Poster"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {video && !loading && (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  )
}

/**
 * COMPONENT: Liquid Tracking Preview Card (Center-Scale Overlap)
 */
function MediaPreviewCard({
  node,
  targetX,
  targetY,
}: {
  node: CustomPageNode | null
  targetX: any
  targetY: any
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const springConfig = { damping: 30, stiffness: 350, mass: 0.4 }
  const smoothX = useSpring(targetX, springConfig)
  const smoothY = useSpring(targetY, springConfig)

  if (!mounted || typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {node && node.media?.video && (
        <motion.div
          key="outer-tracking-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ x: smoothX, y: smoothY }}
          className="pointer-events-none fixed top-0 left-0 z-[9999] h-[175px] w-[280px] overflow-hidden rounded-[14px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={node.url}
              initial={{ scale: 0, opacity: 1, zIndex: 10 }}
              animate={{ scale: 1, opacity: 1, zIndex: 10 }}
              exit={{
                scale: 1,
                zIndex: 0,
                opacity: 0.99,
              }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 origin-center overflow-hidden rounded-[14px]"
            >
              <VideoLayer url={node.media.video} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/**
 * MAIN COMPONENT: SidebarContent
 */
export function SidebarContent({ tree }: { tree: PageTree.Root }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const [isScrolledTop, setIsScrolledTop] = useState(false)
  const [isScrolledBottom, setIsScrolledBottom] = useState(false)

  // --- Hover Pill State ---
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null)

  // --- Liquid Hover Video Tracking State ---
  const [previewNode, setPreviewNode] = useState<CustomPageNode | null>(null)
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null)

  const targetX = useMotionValue(0)
  const targetY = useMotionValue(0)

  const handlePointerMove = (e: React.PointerEvent) => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover)").matches
    )
      return

    const { clientX, clientY } = e
    const cardWidth = 280
    const cardHeight = 175
    const gap = 24

    let nextX = clientX + gap
    let nextY = clientY + gap

    if (nextX + cardWidth > window.innerWidth - 16)
      nextX = clientX - gap - cardWidth
    if (nextY + cardHeight > window.innerHeight - 16)
      nextY = clientY - gap - cardHeight

    targetX.set(nextX)
    targetY.set(nextY)
  }

  const handleMouseEnterVideo = (node: CustomPageNode) => {
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover)").matches
    )
      return
    const page = source.getPages().find((p) => p.url === node.url)
    if (!page || !page.data.media || !page.data.media.video) return

    if (leaveTimeout.current) clearTimeout(leaveTimeout.current)

    const nodeWithMedia = { ...node, media: page.data.media }
    hoverTimeout.current = setTimeout(() => setPreviewNode(nodeWithMedia), 500)
  }

  const handleMouseLeaveVideo = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    leaveTimeout.current = setTimeout(() => setPreviewNode(null), 150)
  }

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setIsScrolledTop(scrollTop > 0)
    setIsScrolledBottom(Math.ceil(scrollTop + clientHeight) < scrollHeight - 1)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    const ro = new ResizeObserver(() => checkScroll())
    const mo = new MutationObserver(() => checkScroll())
    ro.observe(el)
    mo.observe(el, { childList: true, subtree: true, attributes: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scrollRef.current) return
      const activeEl = scrollRef.current.querySelector(
        '[data-active-item="true"]'
      )
      if (activeEl)
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const container = scrollRef.current
      if (!container) return
      const links = Array.from(
        container.querySelectorAll('[data-sidebar-link="true"]')
      ) as HTMLElement[]
      if (links.length === 0) return

      const currentIndex = links.indexOf(document.activeElement as HTMLElement)
      e.preventDefault()

      if (e.key === "ArrowDown") {
        const nextIndex =
          currentIndex >= 0 ? (currentIndex + 1) % links.length : 0
        links[nextIndex]?.focus()
      } else if (e.key === "ArrowUp") {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : links.length - 1
        links[prevIndex]?.focus()
      }
    }
  }

  return (
    <div
      className="flex h-full w-full flex-col font-sans"
      onPointerMove={handlePointerMove}
    >
      <MediaPreviewCard
        node={previewNode}
        targetX={targetX}
        targetY={targetY}
      />

      {/* --- SIDEBAR BRANDING (Replaced) --- */}
      <div className="mb-6 flex-none items-center px-4 pt-4">
        <Link
          href="/"
          className="group flex w-full items-center gap-2.5 rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        >
          {/* Logo with hover lift */}
          <div className="flex size-7 shrink-0 items-center justify-center">
            <SatisiumLogo size="100%" />
          </div>

          {/* Text + Superscript Badge */}
          <div className="flex items-start">
            <span className="font-heading text-base font-bold tracking-tight text-foreground">
              Satisium UI
            </span>
            <Badge className="-mt-1 ml-1.5 h-[18px] rounded-[5px] border-none bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90">
              Beta
            </Badge>
          </div>
        </Link>
      </div>

      <div className="relative mb-2 flex min-h-0 flex-1 flex-col overflow-hidden">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolledTop ? 1 : 0 }}
          className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-24 rounded-2xl border bg-muted mask-[linear-gradient(to_bottom,black,transparent)] backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onKeyDown={handleKeyDown}
          className="pb-4[-ms-overflow-style:none] flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          <LayoutGroup>
            <nav
              className="flex flex-col gap-1 px-2"
              onMouseLeave={() => setHoveredUrl(null)}
            >
              {tree.children.map((node, i) => (
                <motion.div
                  key={node.type === "page" ? node.url : `sidebar-node-${i}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.03,
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  <TreeNode
                    node={node}
                    depth={0}
                    hoveredUrl={hoveredUrl}
                    setHoveredUrl={setHoveredUrl}
                    onMouseEnterVideo={handleMouseEnterVideo}
                    onMouseLeaveVideo={handleMouseLeaveVideo}
                  />
                </motion.div>
              ))}
            </nav>
          </LayoutGroup>
        </div>

        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: isScrolledBottom ? 1 : 0 }}
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-24 rounded-2xl border bg-muted mask-[linear-gradient(to_bottom,black,transparent)] backdrop-blur-sm [-webkit-mask-image:linear-gradient(to_top,black,transparent)]"
        />
      </div>

      <div className="flex flex-col gap-2 rounded-3xl border bg-background p-2 drop-shadow-2xl">
        <div className="flex w-full flex-col items-center gap-2 rounded-2xl border bg-muted p-2">
          <CommandMenuTrigger />
          <SidebarFooter />
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground">
          <span>Built with</span>
          <HugeiconsIcon icon={FavouriteIcon} className="size-5 text-red-500" />
          <span>by</span>
          <Link
            href={"https://satishkumar.xyz/"}
            target="_blank"
            className="text-primary hover:underline focus-visible:outline-none"
          >
            Satishkumar
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * TreeNode Component
 */
function TreeNode({
  node,
  depth,
  hoveredUrl,
  setHoveredUrl,
  onMouseEnterVideo,
  onMouseLeaveVideo,
}: {
  node: PageTree.Node
  depth: number
  hoveredUrl: string | null
  setHoveredUrl: (url: string | null) => void
  onMouseEnterVideo: (n: CustomPageNode) => void
  onMouseLeaveVideo: () => void
}) {
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

    return (
      <Link
        href={node.url}
        data-sidebar-link="true"
        data-active-item={isActive ? "true" : undefined}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={() => {
          setHoveredUrl(node.url)
          onMouseEnterVideo(customNode)
        }}
        onMouseLeave={onMouseLeaveVideo}
        className="group relative flex items-center justify-between gap-3 rounded-md px-4 py-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
      >
        {/* Persistent Active State Indicator */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute -inset-1 rounded-[8px] bg-foreground drop-shadow-2xl dark:-inset-0.5"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        {/* The Magic Liquid Hover Pill */}
        <AnimatePresence>
          {hoveredUrl === node.url && (
            <motion.div
              layoutId="sidebar-hover-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 30,
                mass: 0.8,
              }}
              className="absolute -inset-0.5 -z-10 rounded-[8px] bg-background"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5">
          {node.icon && (
            <span
              className={`flex shrink-0 items-center justify-center transition-colors [&_svg]:size-4 ${isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`}
            >
              {node.icon}
            </span>
          )}
          <span
            className={`truncate text-[13px] transition-colors ${isActive ? "font-medium text-background" : "font-medium text-muted-foreground group-hover:text-foreground"}`}
          >
            {node.name}
          </span>
        </div>

        {customNode.badge && (
          <span
            className={`relative z-10 ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors ${isActive ? "bg-primary text-primary-foreground" : "border border-border bg-transparent text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground"}`}
          >
            {customNode.badge}
          </span>
        )}
      </Link>
    )
  }

  if (node.type === "folder") {
    const indexPage = node.index as CustomPageNode | undefined
    const isIndexActive = indexPage ? pathname === indexPage.url : false

    return (
      <div className="mt-3 flex flex-col">
        {indexPage ? (
          <Link
            href={indexPage.url}
            data-sidebar-link="true"
            data-active-item={isIndexActive ? "true" : undefined}
            aria-current={isIndexActive ? "page" : undefined}
            onMouseEnter={() => {
              setHoveredUrl(indexPage.url)
              onMouseEnterVideo(indexPage)
            }}
            onMouseLeave={onMouseLeaveVideo}
            className="group relative flex items-center justify-between gap-3 rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          >
            {isIndexActive && (
              <motion.div
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-[12px] bg-foreground drop-shadow-2xl"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            <AnimatePresence>
              {hoveredUrl === indexPage.url && (
                <motion.div
                  layoutId="sidebar-hover-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 -z-10 rounded-md bg-background"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
              {node.icon && (
                <span
                  className={`flex shrink-0 transition-colors [&_svg]:size-5 ${isIndexActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  {node.icon}
                </span>
              )}
              <span
                className={`truncate text-[12px] font-semibold tracking-tight transition-colors ${isIndexActive ? "text-background" : "text-foreground/80 group-hover:text-foreground"}`}
              >
                {node.name}
              </span>
            </div>
            {indexPage.badge && (
              <span
                className={`relative z-10 ml-auto shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase transition-colors ${isIndexActive ? "bg-primary text-primary-foreground" : "border border-border bg-transparent text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground"}`}
              >
                {indexPage.badge}
              </span>
            )}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2 px-3 py-1.5">
            {node.icon && (
              <span className="shrink-0 font-bold text-muted-foreground [&_svg]:size-5">
                {node.icon}
              </span>
            )}
            <span className="truncate text-[12px] font-semibold tracking-tight text-foreground/80">
              {node.name}
            </span>
          </div>
        )}

        <div className="relative mt-1 flex flex-col gap-0.5">
          <div className="ml-5 flex flex-col gap-0.5 pl-1">
            {node.children.map((child) => (
              <TreeNode
                key={child.type === "page" ? child.url : child.$id}
                node={child}
                depth={depth + 1}
                hoveredUrl={hoveredUrl}
                setHoveredUrl={setHoveredUrl}
                onMouseEnterVideo={onMouseEnterVideo}
                onMouseLeaveVideo={onMouseLeaveVideo}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
