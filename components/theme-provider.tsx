"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { switchThemeWithTransition } from "@/lib/theme-transition"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {/* 
        ✨ Safely Encapsulated View Transition Styles
        Prevents breaking standard Next.js page transitions
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .satis-theme-transition::view-transition-old(root),
        .satis-theme-transition::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        .satis-theme-transition::view-transition-new(root) {
          z-index: 9999;
        }
      `,
        }}
      />
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() !== "d") return
      if (isTypingTarget(event.target)) return

      const newTheme = resolvedTheme === "dark" ? "light" : "dark"

      // ✨ Trigger the transition via Hotkey (Using Diagonal Sweep)
      switchThemeWithTransition(setTheme, newTheme, event, "fade")
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [resolvedTheme, setTheme])

  return null
}
