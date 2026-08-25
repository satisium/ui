import type { Metadata, Viewport } from "next"
import {
  Plus_Jakarta_Sans,
  Inter,
  IBM_Plex_Mono,
  Caveat,
} from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { CSPostHogProvider } from "@/components/analytics-provider"
import { ConsentProvider } from "@/lib/consent"
import { ConsentBanner } from "@/components/consent-banner"
import { Suspense } from "react"
import { SITE_URL } from "@/lib/config"
import { ORGANIZATION_SAME_AS, TWITTER_CREATOR } from "@/lib/social-links"
import PostHogPageView from "@/components/posthog-pageview"
import { CommandMenuDialog } from "@/components/layout/command-menu"
import { source } from "@/lib/source"
import { ViewportBlocker } from "@/components/viewport-blocker"
import WebVitals from "@/components/web-vitals"

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

const fontCaveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["500", "600"],
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
    languages: { "en-US": "/" },
    types: {
      "application/llms+txt": "/llms.txt",
      "text/markdown": "/llms-full.txt",
    },
  },
  keywords: [
    "animated components",
    "shadcn ui",
    "tailwind v4",
    "framer motion",
    "gsap",
    "react components",
    "design engineers",
    "ui library",
    "satisium ui",
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // We use a conditional check here so TypeScript doesn't complain about undefined values
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    type: "website",
    siteName: "Satisium UI",
    locale: "en_US",
    images: [
      {
        url: "/api/og?title=Animated component library for design engineers",
        width: 1200,
        height: 630,
        alt: "Satisium UI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Satisium UI | Animated component library for design engineers",
    description:
      "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    creator: TWITTER_CREATOR,
    images: [
      {
        url: "/api/og?title=Animated component library for design engineers",
        width: 1200,
        height: 630,
        alt: "Satisium UI",
      },
    ],
  },
  other: {
    "og:logo": `${SITE_URL}/android-chrome-512x512.png`,
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
        fontHeading.variable,
        fontBody.variable,
        fontCode.variable,
        fontCaveat.variable
      )}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Satisium UI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="preload"
          as="style"
          crossOrigin=""
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
        <link
          rel="preload"
          as="style"
          crossOrigin=""
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <link
          rel="preload"
          as="style"
          crossOrigin=""
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
        <link
          rel="preload"
          as="style"
          crossOrigin=""
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap"
        />
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
              sameAs: ORGANIZATION_SAME_AS,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/android-chrome-512x512.png`,
                width: 512,
                height: 512,
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Satisium UI",
              description:
                "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
              url: SITE_URL,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              sameAs: ORGANIZATION_SAME_AS,
              offers: {
                "@type": "Offer",
                price: "0.00",
                priceCurrency: "USD",
                description: "Free components",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Satisium UI",
              description:
                "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
              url: SITE_URL,
              inLanguage: "en-US",
            }),
          }}
        />
      </head>

      <body>
        <ConsentProvider>
          <CSPostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
              <WebVitals />
            </Suspense>
            <ThemeProvider>
              <ViewportBlocker />

              {children}
              <CommandMenuDialog docsTree={source.pageTree} />
            </ThemeProvider>
            <ConsentBanner />
          </CSPostHogProvider>
        </ConsentProvider>
      </body>
    </html>
  )
}
