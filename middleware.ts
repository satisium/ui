// middleware.ts
import { NextResponse, userAgent } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 1. Extract device information from the incoming request
  const { device } = userAgent(request)

  // Consider both mobile phones and tablets as "mobile"
  const isMobile = device.type === "mobile" || device.type === "tablet"

  // 2. Define the path the user is trying to access
  const path = request.nextUrl.pathname

  // 3. If they are on mobile AND trying to access anything other than the landing page
  if (isMobile && path !== "/") {
    // Clone the URL to redirect them back to the landing page
    const url = request.nextUrl.clone()
    url.pathname = "/"

    // Pro-UX Tip: Attach a query parameter so we can show them a toast message explaining WHY they were redirected
    url.searchParams.set("device", "mobile-restricted")

    // Instantly redirect (HTTP 307) before the browser even tries to load the app
    return NextResponse.redirect(url)
  }

  // Otherwise, let them proceed normally
  return NextResponse.next()
}

// 4. Configure which routes the middleware should run on
export const config = {
  // Run on all routes EXCEPT API routes, Next.js static files, images, etc.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
