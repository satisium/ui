"use client"

import { CurvedCarousel } from "@/registry/ui/curved-carousel"

export default function CurvedCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Container spans full screen, interaction anywhere is captured */}
      <div className="absolute inset-0 z-0">
        <CurvedCarousel
          images={images}
          // Spatial Settings
          radiusMultiplier={1.4}
          // Physics & Shaders
          centrifugalMultiplier={0.3} // How much edges pull outward on spin
          parallaxIntensity={1.2} // Smooth internal texture sliding
          chromaticAberrationIntensity={0.05} // Color split intensity on speed
          // Theme Integration
          cornerRadius={0.05} // Modern rounded edges
          fadeMultiplier={1.4} // Alpha fades cleanly into the theme background
          dimmingMultiplier={0.6} // Adds realistic shading to the background cards
          scrollSensitivity={0.001}
        />
      </div>

      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Spin / Swipe
        </p>
      </div>
    </main>
  )
}
