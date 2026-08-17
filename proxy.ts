// proxy.ts
import { NextResponse, userAgent } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/r/") && pathname.endsWith(".json")) {
    return NextResponse.next()
  }

  // ==========================================
  // 1. SHADCN REGISTRY TRACKING
  // ==========================================
  // Removed: registry JSON tracking to prevent unnecessary Redis
  // operations and proxy compute on static CDN assets.

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
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)",
  ],
}
