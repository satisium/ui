"use client"

import { useReportWebVitals } from "next/web-vitals"
import { usePostHog } from "posthog-js/react"

export default function WebVitals() {
  const posthog = usePostHog()

  useReportWebVitals((metric) => {
    if (typeof window === "undefined" || !posthog) return
    posthog.capture(metric.name, {
      id: metric.id,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigation_type: metric.navigationType,
    })
  })

  return null
}
