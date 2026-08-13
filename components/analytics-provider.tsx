// components/analytics-provider.tsx
"use client"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"

/**
 * Wraps the application to provide PostHog tracking context.
 * We disable auto page-view capture because we want to manually send rich
 * MDX Schema data (like badge, category) on our docs pages.
 */
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize if the key exists (prevents crashes in local dev if you forgot your .env)
    if (process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
        api_host:
          process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"
            : "/ingest",
        ui_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",

        capture_pageview: false, // Disabled for manual, enriched page tracking
        capture_pageleave: true, // Tracks how long users stay on a component page
        person_profiles: "identified_only",
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
