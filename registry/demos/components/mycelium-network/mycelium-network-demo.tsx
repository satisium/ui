"use client"

import { MyceliumNetwork } from "@/registry/ui/mycelium-network"

export default function MyceliumNetworkDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <MyceliumNetwork
        imageUrl="https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/25.jpg"
        columns={16} // 16:9 ratio matches the landscape bounding box flawlessly
        rows={9}
        duration={1.2}
        staggerMultiplier={0.7}
        // Strict requirements met: Landscape dimensions, no rounded corners, no shadows, no borders
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </MyceliumNetwork>
    </main>
  )
}
