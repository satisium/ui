"use client"

import { useConsent } from "@/lib/consent"
import { Button } from "@/components/ui/button"

export function ConsentBanner() {
  const { status, accept, decline } = useConsent()

  if (status !== "pending") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
        <p className="text-sm text-muted-foreground">
          We use analytics to understand how our components are used and to
          improve the documentation experience. No personal data is sold or
          shared. Review our{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">
            privacy policy
          </a>{" "}
          for details.
        </p>
        <div className="flex shrink-0 gap-3">
          <Button variant="ghost" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
