import type { Metadata } from "next"
import { source } from "@/lib/source"

import { SpatialLayout } from "@/components/layout/spatial-layout"

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
