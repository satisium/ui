// hooks/use-scroll-spy.ts
"use client"

import { useEffect, useState } from "react"

export function useScrollSpy(ids: string[], offset: number = 100) {
  const [activeId, setActiveId] = useState<string>("")
  const [clickLockedId, setClickLockedId] = useState<string | null>(null)

  useEffect(() => {
    // Highly tuned rootMargin: It triggers when a heading hits the top 20% of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only update if we aren't locked into a programmatic click scroll
          if (entry.isIntersecting && !clickLockedId) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: `-${offset}px 0px -80% 0px` }
    )

    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [ids, offset, clickLockedId])

  // Clear the click lock after 800ms (sufficient time for smooth scrolling to settle)
  useEffect(() => {
    if (clickLockedId) {
      const timer = setTimeout(() => {
        setClickLockedId(null)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [clickLockedId])

  // A manual setter we can call onClick
  const setClickId = (id: string) => {
    setClickLockedId(id)
    setActiveId(id)
  }

  return { activeId, setClickId }
}
