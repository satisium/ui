import type { Metadata } from "next"

import { SpatialLayout } from "@/components/layout/spatial-layout"

export const metadata: Metadata = {
  title: "Premium UI Library",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SpatialLayout>{children}</SpatialLayout>
}
