"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ConsentStatus = "pending" | "accepted" | "declined"

interface ConsentContextValue {
  status: ConsentStatus
  isInitialized: boolean // <-- NEW: Tracks if we have checked localStorage
  accept: () => void
  decline: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export const CONSENT_KEY = "satisium-analytics-consent"

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("pending")
  const [isInitialized, setIsInitialized] = useState(false) // <-- NEW

  useEffect(() => {
    // This runs only on the client, after the initial render
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored === "accepted") setStatus("accepted")
    else if (stored === "declined") setStatus("declined")

    // We have checked storage, safe to render the banner now!
    setIsInitialized(true)
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted")
    setStatus("accepted")
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined")
    setStatus("declined")
  }

  return (
    <ConsentContext.Provider value={{ status, isInitialized, accept, decline }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider")
  return ctx
}
