"use client"

import React, { useEffect, useState } from "react"

/**
 * Wraps components inside the `/embed` route.
 * Listens for `window.postMessage` events from the parent Docs site
 * to seamlessly remount React components without triggering a slow network request.
 */
export function IframeBridgeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security Check: Ensure message comes from our own origin
      // if (event.origin !== window.location.origin) return

      if (event.data?.type === "SATISIUM_RELOAD_ANIMATION") {
        setReloadKey((prev) => prev + 1)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    // Replicates the padding and centering of the direct ResizablePlayground wrapper.
    // The key forces a React unmount/remount, perfectly resetting framer-motion/GSAP animations.
    <div
      key={reloadKey}
      className="flex min-h-screen w-full items-center justify-center overflow-auto bg-background font-sans text-foreground antialiased"
    >
      {children}
    </div>
  )
}
