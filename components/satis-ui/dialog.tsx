"use client"

import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"
import { AnimatePresence, HTMLMotionProps, motion } from "motion/react"
import * as React from "react"

// --- 1. CONTEXT & STATE MANAGEMENT ---
interface MorphingDialogContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  layoutId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const MorphingDialogContext =
  React.createContext<MorphingDialogContextType | null>(null)

function useMorphingDialog() {
  const context = React.useContext(MorphingDialogContext)
  if (!context)
    throw new Error(
      "MorphingDialog components must be used within a MorphingDialog provider"
    )
  return context
}

// --- 2. ROOT PROVIDER ---
export function MorphingDialog({
  children,
  layoutId,
}: {
  children: React.ReactNode
  layoutId: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Handle Escape key and Body Scroll Lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false)
      }
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.style.overflow = "unset"
        document.removeEventListener("keydown", handleKeyDown)
      }
    } else {
      // Return focus to trigger when closing
      if (triggerRef.current) {
        triggerRef.current.focus()
      }
    }
  }, [isOpen])

  return (
    <MorphingDialogContext.Provider
      value={{ isOpen, setIsOpen, layoutId, triggerRef }}
    >
      {children}
    </MorphingDialogContext.Provider>
  )
}

// --- 3. TRIGGER BUTTON ---
export const MorphingDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<"button">
>(({ className, children, onClick, ...props }, ref) => {
  const { setIsOpen, layoutId, triggerRef } = useMorphingDialog()

  return (
    <motion.button
      // Spread props first so our custom onClick and layoutId overwrite them properly
      {...props}
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      layoutId={layoutId}
      onClick={(e) => {
        setIsOpen(true)
        // Fire any custom onClick passed by the user
        onClick?.(e)
      }}
      className={cn(className)}
    >
      <motion.span
        layoutId={`${layoutId}-content`}
        className="flex w-full items-center justify-center"
      >
        {children}
      </motion.span>
    </motion.button>
  )
})
MorphingDialogTrigger.displayName = "MorphingDialogTrigger"

// --- 4. DIALOG CONTENT (THE MODAL) ---
export function MorphingDialogContent({
  className,
  children,
  showCloseButton = true,
}: {
  className?: string
  children: React.ReactNode
  showCloseButton?: boolean
}) {
  const { isOpen, setIsOpen, layoutId } = useMorphingDialog()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} // Click outside to close
            className="fixed inset-0 z-50 backdrop-blur-sm"
          />

          {/* DIALOG CONTAINER */}
          <motion.div
            layoutId={layoutId}
            role="dialog"
            aria-modal="true"
            // THE CENTERING TRICK: inset-0 m-auto h-fit replaces translate-x/y
            className={cn(
              "fixed inset-0 z-50 m-auto flex h-fit w-full max-w-[calc(100%-2rem)] flex-col gap-4 overflow-hidden rounded-xl bg-popover p-6 text-popover-foreground shadow-2xl ring-1 ring-border outline-none sm:max-w-lg",
              className
            )}
          >
            {/* Morphing the content bridge */}
            <motion.div layoutId={`${layoutId}-content`} className="w-full">
              {children}
            </motion.div>

            {/* CLOSE BUTTON */}
            {showCloseButton && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// --- 5. COMPOSABLE SUB-COMPONENTS (Shadcn Style) ---
export function MorphingDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

export function MorphingDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function MorphingDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export function MorphingDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

export function MorphingDialogClose({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setIsOpen } = useMorphingDialog()
  return (
    <button
      onClick={() => setIsOpen(false)}
      className={cn("mt-2 sm:mt-0", className)}
      {...props}
    >
      {children}
    </button>
  )
}
