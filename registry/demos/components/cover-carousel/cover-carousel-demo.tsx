"use client"

import { CoverCarousel } from "@/registry/ui/cover-carousel"

export default function CoverCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* 
        The Deck spans the entire screen absolutely, allowing the user to interact 
        from any point on the screen while the cards stay beautifully centered.
      */}
      <div className="absolute inset-0 z-0">
        <CoverCarousel
          images={images}
          parallaxIntensity={0.15} // Heavy internal texture slide
          activeGapMultiplier={0.6} // Widens the gap on the active center card
          stackGapMultiplier={0.12} // Tightens the overlapping stack
          rotationMultiplier={1.0} // Aggressive 3D rotation on peripheral cards
          dimmingFactor={0.7} // Darkens the background cards beautifully
          shadowOpacity={0.4} // Lowers shadow density to blend in Light Mode
          scrollSensitivity={0.004}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Drag / Scroll
        </p>
      </div>
    </main>
  )
}
