"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

export function MobileRestrictionWarning() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get("device") === "mobile-restricted") {
      setIsVisible(true)

      // Clean the URL instantly
      router.replace("/", { scroll: false })

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => setIsVisible(false), 6000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          // A flat, non-bouncy spring for a highly engineered feel
          transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          className="fixed top-4 right-4 left-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl bg-muted p-4 sm:top-6"
        >
          {/* Minimal Icon */}
          <HugeiconsIcon
            icon={Alert01Icon}
            className="mt-0.5 size-4 shrink-0 text-foreground"
          />

          {/* Minimal Copy */}
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-sm font-semibold text-foreground">
              Desktop optimized
            </span>
            <span className="text-[13px] leading-relaxed text-muted-foreground">
              Please visit on a larger screen to explore the components.
            </span>
          </div>

          {/* Minimal Dismiss Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto flex size-6 shrink-0 items-center justify-center text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none"
            aria-label="Close warning"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
