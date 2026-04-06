import type { Metadata } from "next"
import {
  Antonio,
  Plus_Jakarta_Sans,
  Inter,
  IBM_Plex_Mono,
} from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

// 1. Display Font (Hero Sections)
const fontDisplay = Antonio({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

// 2. Heading Font (h1-h6)
const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

// 3. Body Font (p, small, caption & Shadcn default)
const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

// 4. Code Font (code, pre)
const fontCode = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SATIS UI",
  description: "Animated component library for design engineers.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontDisplay.variable,
        fontHeading.variable,
        fontBody.variable,
        fontCode.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
