"use client"

import { DimensionalCarousel } from "@/registry/ui/dimensional-carousel"

export default function DimensionalCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* 
        The Deck spans the entire screen absolutely, allowing the user to interact 
        from any point on the canvas. 
      */}
      <div className="absolute inset-0 z-0">
        <DimensionalCarousel
          images={images}
          // --- Unified Base Layout ---
          cardWidthRatio={0.35}
          gapMultiplier={0.8}
          // --- Unified Geometry ---
          stackGapMultiplier={0.15} // Slightly looser stacking on the left
          depthMultiplier={1.0} // Pushes stacked cards deeper into the background
          rotationMultiplier={0.1} // Sharper tilt as they stack
          flexMultiplier={0.15} // Heavier aerodynamic curve when swiping
          // --- Unified Shaders ---
          parallaxIntensity={1.2} // Satisfying internal window slide
          chromaticAberrationIntensity={0.008} // Pronounced kinetic color splitting
          dimmingMultiplier={0.6} // Clean ambient occlusion shadow
          cornerRadius={0.05} // Modern rounded edges
          scrollSensitivity={0.01}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Flick Horizontally
        </p>
      </div>
    </main>
  )
}
