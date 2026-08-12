import type { Metadata, Viewport } from "next"
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
import { SITE_URL } from "@/lib/config"
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
  metadataBase: new URL(SITE_URL),
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
    images: [{ url: "/api/og?title=Satisium UI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Satisium UI | Animated component library for design engineers",
    description:
      "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    creator: "@iamsatish4564",
    images: [{ url: "/api/og?title=Satisium UI" }],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: "/apple-icon.png",
    other: [{ rel: "apple-touch-icon", url: "/apple-icon.png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  colorScheme: "light dark",
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
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/docs/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Satisium UI",
              url: SITE_URL,
              sameAs: [
                "https://github.com/satisium-ui/ui",
                "https://twitter.com/iamsatish4564",
              ],
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/icon-512.png`,
                width: 512,
                height: 512,
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
