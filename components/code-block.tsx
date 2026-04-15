// src/components/code-block.tsx

"use client"

import { Check, ChevronRight, Copy, Folder, PanelLeft } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "next-themes"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { createHighlighter, Highlighter } from "shiki"

import { cn } from "@/lib/utils"
import { DefaultFileIcon, ReactIcon, TSIcon } from "./icons"

// ============================================================================
// TYPES & ARCHITECTURE
// ============================================================================

export interface CodeFile {
  code: string
  language?: string
}

export interface CodeBlockProps {
  files: Record<string, CodeFile | string>
  defaultFile?: string
  height?: string | number
  className?: string
}

type FileNode = { name: string; type: "file"; path: string }
type FolderNode = {
  name: string
  type: "folder"
  path: string
  children: TreeNode[]
}
type TreeNode = FileNode | FolderNode

const BASE_PADDING = 12
const DEPTH_OFFSET = 22

const scrollbarClasses =
  "overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50[&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border transition-all"

const getIconForFile = (filename: string, isActive: boolean) => {
  const ext = filename.split(".").pop()?.toLowerCase()
  const baseClasses = "h-4 w-4 shrink-0 transition-colors duration-200"
  switch (ext) {
    case "tsx":
    case "jsx":
      return (
        <ReactIcon
          className={cn(
            baseClasses,
            isActive ? "text-[#61DAFB]" : "text-muted-foreground"
          )}
        />
      )
    case "ts":
      return (
        <TSIcon
          className={cn(
            baseClasses,
            isActive ? "text-[#3178C6]" : "text-muted-foreground"
          )}
        />
      )
    default:
      return (
        <DefaultFileIcon
          className={cn(
            baseClasses,
            isActive ? "text-background/80" : "text-muted-foreground"
          )}
        />
      )
  }
}

function buildTree(files: Record<string, any>): TreeNode[] {
  const root: TreeNode[] = []
  Object.keys(files).forEach((path) => {
    const parts = path.split("/")
    let currentLevel = root
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      let existing = currentLevel.find((n) => n.name === part)
      if (!existing) {
        if (isFile) {
          currentLevel.push({ name: part, type: "file", path })
        } else {
          const folderNode: FolderNode = {
            name: part,
            type: "folder",
            path: parts.slice(0, index + 1).join("/"),
            children: [],
          }
          currentLevel.push(folderNode)
          existing = folderNode
        }
      }
      if (!isFile) currentLevel = (existing as FolderNode).children
    })
  })

  function optimize(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
      if (node.type === "folder") {
        node.children = optimize(node.children)
        if (node.children.length === 1 && node.children[0].type === "folder") {
          const child = node.children[0] as FolderNode
          return { ...child, name: `${node.name}/${child.name}` }
        }
      }
      return node
    })
  }
  return optimize(root)
}

let highlighterPromise: Promise<Highlighter> | null = null

// ============================================================================
// STABLE SIDEBAR COMPONENTS
// ============================================================================

interface SidebarProps {
  nodes: TreeNode[]
  depth?: number
  activeFile: string
  onSelectFile: (path: string) => void
  layoutIdPrefix: string
}

const SidebarTree = ({
  nodes,
  depth = 0,
  activeFile,
  onSelectFile,
  layoutIdPrefix,
}: SidebarProps) => (
  <div className="flex w-full flex-col">
    {nodes.map((node) => {
      if (node.type === "folder") {
        return (
          <SidebarFolder
            key={node.path}
            node={node}
            depth={depth}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            layoutIdPrefix={layoutIdPrefix}
          />
        )
      }

      const isActive = activeFile === node.path
      return (
        <button
          key={node.path}
          onClick={() => onSelectFile(node.path)}
          className={cn(
            "group relative flex w-full items-center gap-2 py-0.5 text-left text-sm transition-colors",
            isActive
              ? "font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          style={{ paddingLeft: `${BASE_PADDING + depth * DEPTH_OFFSET}px` }}
        >
          <span className="relative flex w-fit items-center gap-2 rounded-md px-2 py-1.5">
            {isActive && (
              <motion.div
                layoutId={`${layoutIdPrefix}-active-file`}
                className="absolute inset-0 -inset-x-2 z-0 ml-5 rounded-md border border-border/50 bg-foreground shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-2">
              <div className="h-3.5 w-3.5 shrink-0" />
              {getIconForFile(node.name, isActive)}
              <span
                className={cn("truncate", isActive && "text-background/80")}
              >
                {node.name}
              </span>
            </div>
          </span>
        </button>
      )
    })}
  </div>
)

const SidebarFolder = ({
  node,
  depth,
  activeFile,
  onSelectFile,
  layoutIdPrefix,
}: {
  node: FolderNode
  depth: number
  activeFile: string
  onSelectFile: (path: string) => void
  layoutIdPrefix: string
}) => {
  const isChildActive = activeFile.startsWith(node.path + "/")
  const [isOpen, setIsOpen] = useState(isChildActive)

  return (
    <div className="relative flex w-full flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex w-full items-center gap-2 py-0.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
        )}
        style={{ paddingLeft: `${BASE_PADDING + depth * DEPTH_OFFSET}px` }}
      >
        <span className="relative flex w-fit items-center gap-2 rounded-md px-2 py-1.5">
          <div className="absolute inset-0 z-0 rounded-md bg-background/50 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10 flex items-center gap-2">
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                isOpen && "rotate-90"
              )}
            />
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative overflow-hidden"
          >
            <div
              className="absolute top-0 bottom-0 w-px bg-border/50"
              style={{ left: `${BASE_PADDING + depth * DEPTH_OFFSET + 7}px` }}
            />
            <SidebarTree
              nodes={node.children}
              depth={depth + 1}
              activeFile={activeFile}
              onSelectFile={onSelectFile}
              layoutIdPrefix={layoutIdPrefix}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CodeBlock({
  files,
  defaultFile,
  height,
  className,
}: CodeBlockProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const filesHash = JSON.stringify(files)
  const fileKeys = useMemo(() => Object.keys(files), [filesHash])
  const tree = useMemo(() => buildTree(files), [filesHash])
  const isMultiFile = fileKeys.length > 1

  const initialActive =
    defaultFile && files[defaultFile] ? defaultFile : fileKeys[0]

  // ✨ FIX: Safe derived state pattern
  // If the previous activeFileState doesn't exist in the new files prop, gracefully fallback
  const [activeFileState, setActiveFileState] = useState(initialActive)
  const activeFile = files[activeFileState] ? activeFileState : initialActive

  // ✨ FIX: Self-correcting state sync
  useEffect(() => {
    if (activeFileState !== activeFile) {
      setActiveFileState(activeFile)
    }
  }, [activeFileState, activeFile])

  const [copied, setCopied] = useState(false)

  // Dual-State Architecture for SSR safety
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [highlightedFiles, setHighlightedFiles] = useState<
    Record<string, string>
  >({})
  const layoutIdPrefix = useId()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeFile])

  // Centralized File Selection Handler
  const handleSelectFile = (path: string) => {
    setActiveFileState(path)
    setIsMobileSidebarOpen(false) // Auto-close drawer on mobile when file is selected
  }

  // Background Compilation Engine
  useEffect(() => {
    if (!mounted) return
    let isCanceled = false

    async function highlightAll() {
      if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
          themes: ["github-light", "github-dark"],
          langs: [
            "typescript",
            "javascript",
            "tsx",
            "jsx",
            "json",
            "css",
            "html",
            "bash",
          ],
        })
      }
      const highlighter = await highlighterPromise
      const activeTheme =
        resolvedTheme === "dark" ? "github-dark" : "github-light"
      const newHighlighted: Record<string, string> = {}

      for (const path of fileKeys) {
        const data = files[path]
        const codeString = typeof data === "string" ? data : data.code
        const ext = path.split(".").pop() || "tsx"
        const lang = typeof data === "string" ? ext : data.language || ext

        const html = highlighter.codeToHtml(codeString, {
          lang,
          theme: activeTheme,
          transformers: [
            {
              pre(node) {
                node.properties.style = ""
                return node
              },
            },
          ],
        })
        newHighlighted[path] = html
      }

      if (!isCanceled) setHighlightedFiles(newHighlighted)
    }
    highlightAll()

    return () => {
      isCanceled = true
    }
  }, [filesHash, fileKeys, resolvedTheme, mounted])

  const handleCopy = () => {
    const data = files[activeFile]
    const codeString = typeof data === "string" ? data : data.code
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-full animate-pulse rounded-3xl border border-border/50 bg-muted/50 p-2 shadow-sm",
          !height && "h-full"
        )}
        style={height ? { height } : undefined}
      />
    )
  }

  // ✨ FIX: Bulletproof property parsing.
  // If files[activeFile] happens to evaluate to undefined during a split-second React tick, this defaults to "" instead of crashing.
  const activeRawCode = !files[activeFile]
    ? ""
    : typeof files[activeFile] === "string"
      ? files[activeFile]
      : (files[activeFile] as CodeFile).code

  return (
    <div
      style={height ? { height } : undefined}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-muted/50 p-1.5 shadow-sm",
        !height && "h-full",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 pt-1 pb-2">
        <div className="flex items-center gap-3 overflow-hidden">
          {isMultiFile && (
            <>
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-sm md:flex"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground hover:shadow-sm md:hidden"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="flex items-center gap-2">
            {!isMultiFile && getIconForFile(activeFile, true)}
            <span className="truncate text-sm font-medium text-muted-foreground">
              {!isMultiFile ? activeFile : activeFile.split("/").pop()}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="h-3.5 w-3.5 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Copy className="h-3.5 w-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-start overflow-hidden">
        <motion.div
          initial={false}
          animate={{
            marginLeft: isDesktopSidebarOpen && isMultiFile ? 0 : -240,
            opacity: isDesktopSidebarOpen && isMultiFile ? 1 : 0,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "z-10 hidden h-full w-60 shrink-0 md:block",
            (!isDesktopSidebarOpen || !isMultiFile) && "pointer-events-none"
          )}
        >
          <div className={`h-full w-full pr-3 pb-2 ${scrollbarClasses}`}>
            <SidebarTree
              nodes={tree}
              activeFile={activeFile}
              onSelectFile={handleSelectFile}
              layoutIdPrefix={`${layoutIdPrefix}-desktop`}
            />
          </div>
        </motion.div>

        <AnimatePresence>
          {isMobileSidebarOpen && isMultiFile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute inset-0 z-30 rounded-2xl bg-background/40 backdrop-blur-sm md:hidden"
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-y-0 left-0 z-40 w-full rounded-2xl border-r border-border/50 bg-muted/95 py-2 shadow-2xl backdrop-blur-3xl md:hidden"
              >
                <div className={`h-full w-full pr-3 ${scrollbarClasses}`}>
                  <SidebarTree
                    nodes={tree}
                    activeFile={activeFile}
                    onSelectFile={handleSelectFile}
                    layoutIdPrefix={`${layoutIdPrefix}-mobile`}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          className={`relative z-0 flex h-full min-w-0 flex-1 flex-col rounded-2xl border border-border/50 bg-background shadow-sm ${scrollbarClasses}`}
        >
          <div className="[&_pre]:bg-transparent[&_pre]:p-0 leading-relaxed[&_pre]:m-0 w-full p-4 font-mono text-sm [&_pre]:wrap-break-word [&_pre]:whitespace-pre-wrap">
            {highlightedFiles[activeFile] ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightedFiles[activeFile],
                }}
              />
            ) : (
              <pre className="wrap-break-word whitespace-pre-wrap">
                <code>{activeRawCode as string}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
