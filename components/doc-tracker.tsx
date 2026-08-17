// components/doc-tracker.tsx
"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

interface DocTrackerProps {
  title: string
  category?: string
  badge?: string
}

export function DocTracker({
  title,
  category,
  badge,
}: DocTrackerProps) {
  useEffect(() => {
    // ✨ ANALYTICS: Track rich page views
    // Sends full context to PostHog, and increments the "page_view" counter in Redis
    trackEvent(
      "doc_page_viewed",
      {
        component_name: title,
        category: category || "uncategorized",
        badge: badge || "none",
      },
      "page_view"
    )
  }, [title, category, badge])

  return null // This component is completely invisible
}
