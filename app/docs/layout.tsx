import type { Metadata } from "next"
import { source } from "@/lib/source"
import { SITE_URL } from "@/lib/config"

import { SpatialLayout } from "@/components/layout/spatial-layout"

export const metadata: Metadata = {
  title: "Docs | Satisium UI",
  description:
    "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
  alternates: { canonical: `${SITE_URL}/docs` },
  openGraph: {
    title: "Docs | Satisium UI",
    description:
      "Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    images: [{ url: "/api/og?title=Documentation" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const tree = source.pageTree

  return <SpatialLayout tree={tree}>{children}</SpatialLayout>
}
