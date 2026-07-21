"use client"

import { LiquidCurtain } from "@/registry/ui/liquid-curtain"

export default function LiquidCurtainDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased">
      <LiquidCurtain
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/0.jpg"
        columns={24} // More columns for finer, stringier slats on landscape
        duration={1.2}
        staggerAmount={0.6}
        ease="power2.inOut"
        // Strict requirements met: Landscape dimensions, no rounded corners, no shadows, no borders
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </LiquidCurtain>
    </main>
  )
}
