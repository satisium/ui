// components/viewport-blocker.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

export function ViewportBlocker() {
  const pathname = usePathname()

  // Allow the landing page to be viewed on any screen size
  if (pathname === "/") return null

  return (
    // Covers the entire screen, strictly visible only on screens smaller than `md`
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center md:hidden">
      <div className="flex max-w-sm flex-col items-center gap-1.5">
        {/* Minimal Copy */}
        <h2 className="font-heading text-base font-semibold tracking-wide text-foreground">
          Desktop optimized
        </h2>
        <p className="mb-4 font-sans text-[13px] leading-relaxed text-muted-foreground">
          Please maximize your browser window or use a larger screen to explore
          the component library.
        </p>

        {/* Minimal Squircle Escape Button */}
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-[1rem] bg-foreground px-6 font-heading text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none active:scale-[0.98]"
        >
          Go to home
        </Link>
      </div>
    </div>
  )
}
