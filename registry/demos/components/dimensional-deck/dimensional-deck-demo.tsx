"use client"

import { DimensionalDeck } from "@/registry/ui/dimensional-deck"

export default function DimensionalDeckDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DimensionalDeck
          images={images}
          // --- Unified Base Layout ---
          cardWidthRatio={0.5}
          gapMultiplier={1.2}
          // --- Unified Geometry ---
          stackGapMultiplier={0.15}
          depthMultiplier={1.0}
          rotationMultiplier={0.1}
          flexMultiplier={0.15}
          // --- Unified Shaders ---
          parallaxIntensity={1.2}
          chromaticAberrationIntensity={0.008}
          dimmingMultiplier={0.6}
          cornerRadius={0.05}
          scrollSensitivity={0.01}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Scroll / Drag Vertically Or Drag Horizontally
        </p>
      </div>
    </main>
  )
}
