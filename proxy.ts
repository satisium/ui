// proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"
import { Redis } from "@upstash/redis"

/**
 * Edge Proxy to intercept shadcn registry installations.
 * This tracks actual CLI usage (terminal installations) completely invisibly.
 */
export function proxy(req: NextRequest, ev: NextFetchEvent) {
  const { pathname } = req.nextUrl

  // Intercept ONLY requests heading to your shadcn registry JSON files
  if (pathname.startsWith("/r/") && pathname.endsWith(".json")) {
    // Extract the component name (e.g., "/r/fluid-switch.json" -> "fluid-switch")
    const componentName = pathname.replace("/r/", "").replace(".json", "")

    // ev.waitUntil allows the user's terminal to download the JSON instantly,
    // while the server updates the Upstash Redis database in the background.
    ev.waitUntil(
      (async () => {
        try {
          const redis = Redis.fromEnv()
          // 1. Increment total CLI downloads
          await redis.incr("satis:metrics:cli_installs")
          // 2. Increment specific component leaderboard
          await redis.zincrby("satis:metrics:top_cli", 1, componentName)
        } catch (e) {
          // Silent fail - never break the terminal installation
        }
      })()
    )
  }

  // Continue processing the request normally
  return NextResponse.next()
}

// Config ensures this proxy ONLY runs on /r/ registry routes to save server compute
export const config = {
  matcher: ["/r/:path*"],
}
