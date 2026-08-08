// components/viewport-blocker.tsx
"use client"

import { usePathname } from "next/navigation"

export function ViewportBlocker() {
  const pathname = usePathname()

  // Allow the landing page to be viewed on any screen size
  if (pathname === "/") return null

  return (
    // Covers the entire screen, strictly visible only on screens smaller than `md`
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center md:hidden">
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="font-heading text-base font-semibold tracking-wide text-foreground">
          Desktop optimized
        </h2>
        <p className="font-sans text-[13px] leading-relaxed text-muted-foreground">
          Please maximize your browser window or use a larger screen to explore
          the component library.
        </p>
      </div>
    </div>
  )
}
