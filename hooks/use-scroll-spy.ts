"use client"

import { useEffect, useState } from "react"

export function useScrollSpy(ids: string[], offset: number = 100) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // Highly tuned rootMargin: It triggers when a heading hits the top 20% of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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
  }, [ids, offset])

  return activeId
}
