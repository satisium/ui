"use client"

import { ElasticCarousel } from "@/registry/ui/elastic-carousel"

export default function ElasticCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <ElasticCarousel
          images={images}
          // --- Unified Base Layout ---
          cardWidthRatio={0.35}
          gapMultiplier={1.2}
          radiusMultiplier={1.4}
          // --- Unified Geometry ---
          flexMultiplier={0.7} // Aggressively pulls into a 3D cylinder when swiped
          // --- Unified Shaders ---
          parallaxIntensity={0.6} // Satisfying internal window slide
          chromaticAberrationIntensity={0.005} // Smooth kinetic color splitting
          dimmingMultiplier={0.5} // Deep ambient shadows when curled
          cornerRadius={0.04} // Modern rounded edges
          scrollSensitivity={0.001}
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
