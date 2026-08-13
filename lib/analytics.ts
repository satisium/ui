// lib/analytics.ts
import posthog from "posthog-js"

/**
 * Universal tracking function for Satisium UI
 *
 * @param eventName - The name of the event (e.g., "code_copied")
 * @param properties - The rich data/context (e.g., { component: "component-name", category: "text-reveals" })
 * @param incrementPublicCounter - Optional. If provided, also increments our public Redis database for landing page vanity metrics.
 */
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, any>,
  incrementPublicCounter?: "web_copy" | "page_view"
) => {
  // 1. Send deep product data to PostHog (Only in production/browser)
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN
  ) {
    posthog.capture(eventName, properties)
  }

  // 2. Ping our Next.js API to increment the Upstash Redis counters for the landing page
  if (incrementPublicCounter) {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: incrementPublicCounter,
          component: properties?.component || properties?.file || "unknown",
        }),
        // keepalive ensures the fetch finishes even if the user navigates away immediately
        keepalive: true,
      })
    } catch (e) {
      // We catch and swallow errors here. Analytics should NEVER break the user's UI.
      console.error("Satisium Telemetry Error:", e)
    }
  }
}
