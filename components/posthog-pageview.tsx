"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { usePostHog } from "posthog-js/react"
import { useConsent } from "@/lib/consent"

export default function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  const { status } = useConsent()

  const currentUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (pathname && posthog && status === "accepted") {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      if (currentUrlRef.current && currentUrlRef.current !== url) {
        posthog.capture("$pageleave", { $current_url: currentUrlRef.current })
      }

      posthog.capture("$pageview", { $current_url: url })

      currentUrlRef.current = url
    }
  }, [pathname, searchParams, posthog, status])

  useEffect(() => {
    return () => {
      if (currentUrlRef.current && posthog) {
        posthog.capture("$pageleave", { $current_url: currentUrlRef.current })
      }
    }
  }, [posthog])

  return null
}
