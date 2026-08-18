import { logger } from "@/lib/logger"
import posthog from "posthog-js"
import { hasConsent } from "@/lib/consent-utils"

export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
  incrementPublicCounter?: "web_copy" | "page_view"
) {
  if (!hasConsent()) return

  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN
  ) {
    posthog.capture(eventName, properties)
  }

  if (incrementPublicCounter) {
    try {
      await fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: incrementPublicCounter,
          component: properties?.component || properties?.file || "unknown",
        }),
        keepalive: true,
      })
    } catch (e) {
      logger.error("Satisium Telemetry Error:", e)
    }
  }
}
