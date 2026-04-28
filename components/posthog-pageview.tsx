// components/posthog-pageview.tsx
"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { usePostHog } from "posthog-js/react"

export default function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  // ✨ Store the current URL so we know what page the user is leaving
  const currentUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      // ✨ If we have an old URL, and it's different from the new one, fire $pageleave
      if (currentUrlRef.current && currentUrlRef.current !== url) {
        posthog.capture("$pageleave", { $current_url: currentUrlRef.current })
      }

      // Fire the new pageview
      posthog.capture("$pageview", { $current_url: url })

      // Update the ref to the current URL
      currentUrlRef.current = url
    }
  }, [pathname, searchParams, posthog])

  // ✨ Handle the case where the user actually closes the browser tab
  useEffect(() => {
    return () => {
      if (currentUrlRef.current && posthog) {
        posthog.capture("$pageleave", { $current_url: currentUrlRef.current })
      }
    }
  }, [posthog])

  return null
}
