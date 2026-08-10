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
import { CSPostHogProvider } from "@/components/analytics-provider"
import { Suspense } from "react"
import PostHogPageView from "@/components/posthog-pageview"
import { CommandMenuDialog } from "@/components/layout/command-menu"
import { source } from "@/lib/source"
import { ViewportBlocker } from "@/components/viewport-blocker"

const fontDisplay = Antonio({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const fontCode = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.satisium.com"),
  title: {
    template: "%s | Satisium UI",
    default: "Satisium UI | Animated component library for design engineers",
  },
  description:
    "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    siteName: "Satisium UI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satisium UI | Animated component library for design engineers",
    creator: "@iamsatish4564",
  },
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
      <head>
        <meta name="apple-mobile-web-app-title" content="Satisium UI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Satisium UI",
              alternateName: ["SatisiumUI", "Satisium UI Library"],
              url: "https://ui.satisium.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://ui.satisium.com/docs/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>

      <body>
        <CSPostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ThemeProvider>
            <ViewportBlocker />

            {children}
            <CommandMenuDialog docsTree={source.pageTree} />
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  )
}
