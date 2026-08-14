"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ConsentStatus = "pending" | "accepted" | "declined"

interface ConsentContextValue {
  status: ConsentStatus
  accept: () => void
  decline: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

const CONSENT_KEY = "satisium-analytics-consent"

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("pending")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored === "accepted") setStatus("accepted")
    else if (stored === "declined") setStatus("declined")
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted")
    setStatus("accepted")
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined")
    setStatus("declined")
  }

  if (!mounted) return null

  return (
    <ConsentContext.Provider value={{ status, accept, decline }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider")
  return ctx
}
