"use client"

import { useEffect } from "react"
import { usePostHog } from "posthog-js/react"

interface RootErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: RootErrorProps) {
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog && typeof window !== "undefined") {
      const hasConsent =
        localStorage.getItem("satisium-analytics-consent") === "accepted"
      if (hasConsent) {
        posthog.capture("client_error", {
          message: error.message,
          digest: error.digest,
        })
      }
    }
  }, [error, posthog])

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center dark:bg-zinc-950">
          <div className="max-w-md space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Something went wrong
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {error.message || "An unexpected error occurred."}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
