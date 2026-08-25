"use client"

import { GoogleAnalytics as NextGA } from "@next/third-parties/google"
import { useConsent } from "@/lib/consent"

export function GoogleAnalytics() {
  const { status } = useConsent()
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  // If they haven't accepted, or the ID is missing, inject absolutely nothing.
  if (status !== "accepted" || !gaId) return null

  return <NextGA gaId={gaId} />
}
