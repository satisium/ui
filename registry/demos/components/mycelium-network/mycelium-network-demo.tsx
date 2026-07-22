"use client"

import { MyceliumNetwork } from "@/registry/ui/mycelium-network"

export default function MyceliumNetworkDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <MyceliumNetwork
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/0.jpg"
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
