import type { Metadata } from "next"
import { source } from "@/lib/source"

import { SpatialLayout } from "@/components/layout/spatial-layout"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Premium UI Library",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const tree = source.pageTree

  return <SpatialLayout tree={tree}>{children}</SpatialLayout>
}
