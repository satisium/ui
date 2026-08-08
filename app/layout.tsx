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
  metadataBase: new URL("https://satisui.xyz"),
  title: {
    template: "%s | SATIS UI",
    default: "SATIS UI | Animated component library for design engineers",
  },
  description:
    "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    siteName: "SATIS UI",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SATIS UI | Animated component library for design engineers",
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
        <meta name="apple-mobile-web-app-title" content="Satis UI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SATIS UI",
              alternateName: ["SatisUI", "Satis UI Library"],
              url: "https://satisui.xyz",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://satisui.xyz/docs/search?q={search_term_string}",
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
            {children}
            <CommandMenuDialog docsTree={source.pageTree} />
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  )
}
