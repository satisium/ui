"use client"

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

interface CardConfig {
  offset?: { x: number; y: number }
  rotation?: number
}

interface GlidingCardContextType {
  activeId: string | null
  activeContent: React.ReactNode | null
  activeRect: DOMRect | null
  activeConfig: CardConfig
  registerActivation: (
    id: string,
    rect: DOMRect,
    content: React.ReactNode,
    config: CardConfig
  ) => void
  registerDeactivation: () => void
}

const GlidingCardContext = createContext<GlidingCardContextType | undefined>(
  undefined
)

/**
 * Orchestrates the shared state between list items (triggers) and the floating card (content).
 * Handles the logic for "gliding" transitions and hover grace periods.
 */
export function GlidingCard({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeContent, setActiveContent] = useState<React.ReactNode | null>(
    null
  )
  const [activeRect, setActiveRect] = useState<DOMRect | null>(null)
  const [activeConfig, setActiveConfig] = useState<CardConfig>({
    rotation: 0,
    offset: { x: 0, y: 0 },
  })

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const registerActivation = useCallback(
    (
      id: string,
      rect: DOMRect,
      content: React.ReactNode,
      config: CardConfig
    ) => {
      // Cancel pending deactivation to allow "bridging" the gap between adjacent items.
      if (leaveTimer.current) clearTimeout(leaveTimer.current)

      setActiveId(id)
      setActiveContent(content)
      setActiveRect(rect)
      setActiveConfig(config)
    },
    []
  )

  const registerDeactivation = useCallback(() => {
    // Grace period (50ms) prevents flickering if the cursor briefly leaves the hit area
    // while transitioning between items.
    leaveTimer.current = setTimeout(() => {
      setActiveId(null)
    }, 50)
  }, [])

  return (
    <GlidingCardContext.Provider
      value={{
        activeId,
        activeContent,
        activeRect,
        activeConfig,
        registerActivation,
        registerDeactivation,
      }}
    >
      {children}
    </GlidingCardContext.Provider>
  )
}

interface GlidingCardItemProps extends React.HTMLAttributes<HTMLElement> {
  /** The content to be rendered inside the floating card when this item is active. */
  target: React.ReactNode
  /**
   * Positional offset for the card relative to this specific item.
   * Useful for adjustments per item (e.g., pushing the card further right).
   */
  offset?: { x?: number; y?: number }
  /** Rotation in degrees (Z-axis) applied to the card when this item is active. */
  rotation?: number
  /**
   * Polymorphic prop to render the item as a specific HTML tag or Component.
   * @default 'div'
   */
  as?: React.ElementType
}

/**
 * The interactive trigger element. Captures viewport coordinates on interaction
 * and updates the context to position the floating card.
 */
export function GlidingCardItem({
  children,
  className,
  target,
  offset = { x: 0, y: 0 },
  rotation = 0,
  as,
  ...props
}: GlidingCardItemProps) {
  const context = useContext(GlidingCardContext)
  if (!context)
    throw new Error("GlidingCardItem must be used within GlidingCard")

  const id = React.useId()
  const cardId = `gliding-card-${id}`

  // Explicitly cast to ElementType to satisfy TypeScript checks for non-void elements,
  // ensuring the component can accept children.
  const Tag = (as || "div") as React.ElementType<
    React.HTMLAttributes<HTMLElement>
  >

  const handleActivate = (e: React.SyntheticEvent<HTMLElement>) => {
    // Capture live Viewport coordinates to support items in scrolling containers
    const rect = e.currentTarget.getBoundingClientRect()
    context.registerActivation(id, rect, target, {
      rotation,
      offset: { x: offset.x ?? 0, y: offset.y ?? 0 },
    })
  }

  const handleDeactivate = () => {
    context.registerDeactivation()
  }

  return (
    <Tag
      id={id}
      role="button"
      tabIndex={0}
      aria-describedby={context.activeId === id ? cardId : undefined}
      aria-expanded={context.activeId === id}
      // Spread props first so internal handlers take precedence while still calling user-provided handlers
      {...props}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        handleActivate(e)
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        handleDeactivate()
        props.onMouseLeave?.(e)
      }}
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        handleActivate(e)
        props.onFocus?.(e)
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        handleDeactivate()
        props.onBlur?.(e)
      }}
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </Tag>
  )
}

interface GlidingCardContentProps {
  className?: string
}

/**
 * The visual container for the floating card.
 * It calculates positioning relative to the viewport, decoupling it from the DOM hierarchy.
 */
export function GlidingCardContent({ className }: GlidingCardContentProps) {
  const context = useContext(GlidingCardContext)
  if (!context)
    throw new Error("GlidingCardContent must be used within GlidingCard")

  const containerRef = useRef<HTMLDivElement>(null)
  const { activeId, activeContent, activeRect, activeConfig } = context

  const getRelativePosition = () => {
    if (!activeRect || !containerRef.current) return { top: 0 }

    // DECISION: Calculate delta between the Container's rect and the Item's rect.
    // This supports complex layouts (e.g., Grid) where Item and Content are in different DOM sub-trees.
    const containerRect = containerRef.current.getBoundingClientRect()
    const topOfItem = activeRect.top - containerRect.top
    const centerOfItem = topOfItem + activeRect.height / 2

    return { top: centerOfItem + (activeConfig.offset?.y || 0) }
  }

  const pos = getRelativePosition()
  const currentCardId = activeId ? `gliding-card-${activeId}` : undefined

  return (
    <div
      ref={containerRef}
      // pointer-events-none allows clicking through the empty space around the card,
      // while the inner motion.div re-enables pointer events for the card content itself.
      className="pointer-events-none relative h-full w-full"
    >
      <AnimatePresence>
        {activeId && activeRect && (
          <motion.div
            id={currentCardId}
            role="tooltip"
            className={cn(
              "pointer-events-auto absolute left-0 z-50",
              className
            )}
            style={{ transformOrigin: "center left" }}
            initial={{
              opacity: 0,
              scale: 0.9,
              x: (activeConfig.offset?.x || 0) - 20,
              top: pos.top,
              y: "-50%", // Anchor center of card to center of item
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: activeConfig.offset?.x || 0,
              top: pos.top,
              y: "-50%",
              rotateZ: activeConfig.rotation || 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              x: (activeConfig.offset?.x || 0) - 20,
              rotateZ: activeConfig.rotation || 0,
              y: "-50%",
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {activeContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
