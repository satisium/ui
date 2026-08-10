// proxy.ts
import { NextResponse, userAgent } from "next/server"
import type { NextRequest, NextFetchEvent } from "next/server"
import { Redis } from "@upstash/redis"

export function proxy(req: NextRequest, ev: NextFetchEvent) {
  const { pathname } = req.nextUrl

  // ==========================================
  // 1. SHADCN REGISTRY TRACKING
  // ==========================================
  // Intercept ONLY requests heading to your shadcn registry JSON files
  if (pathname.startsWith("/r/") && pathname.endsWith(".json")) {
    const componentName = pathname.replace("/r/", "").replace(".json", "")

    ev.waitUntil(
      (async () => {
        try {
          const redis = Redis.fromEnv()
          await redis.incr("satisium:metrics:cli_installs")
          await redis.zincrby("satisium:metrics:top_cli", 1, componentName)
        } catch (e) {
          // Silent fail - never break the terminal installation
        }
      })()
    )

    // Let CLI requests through immediately, ignoring the mobile check below
    return NextResponse.next()
  }

  // ==========================================
  // 2. MOBILE VIEWPORT RESTRICTION
  // ==========================================
  const { device } = userAgent(req)
  const isMobile = device.type === "mobile" || device.type === "tablet"

  // If they are on a mobile device AND trying to access anything other than the landing page
  if (isMobile && pathname !== "/") {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("device", "mobile-restricted")

    // Kick them back to the landing page instantly
    return NextResponse.redirect(url)
  }

  // Continue processing normal desktop requests
  return NextResponse.next()
}

// ==========================================
// CONFIGURATION
// ==========================================
export const config = {
  // Run on all routes EXCEPT Next.js internals, APIs, and static assets.
  // This ensures it catches both the /r/ registry paths AND normal app pages.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
