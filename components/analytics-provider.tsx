"use client"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"
import { useConsent } from "@/lib/consent"

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const { status } = useConsent()

  useEffect(() => {
    if (status === "accepted") {
      if (process.env.NEXT_PUBLIC_POSTHOG_TOKEN) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN, {
          api_host:
            process.env.NODE_ENV === "development"
              ? process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com"
              : "/ingest",
          ui_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          capture_pageview: false,
          capture_pageleave: true,
          person_profiles: "identified_only",
          disable_session_recording: true,
        })
      }
    } else {
      posthog.opt_out_capturing()
    }
  }, [status])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
