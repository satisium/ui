"use client"

import { DepthCarousel } from "@/registry/ui/depth-carousel"

export default function DepthCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* 
        The component is absolutely positioned inside a full-screen wrapper, 
        making the entire screen interactive while cards stay centered.
      */}
      <div className="absolute inset-0 z-0">
        <DepthCarousel
          images={images}
          cardWidthRatio={0.35}
          gapMultiplier={0.7}
          activeGapMultiplier={0.25}
          depthMultiplier={0.25}
          scaleMultiplier={0.15}
          rotationMultiplier={0.1}
          parallaxIntensity={0.5}
          dimmingMultiplier={0.85}
          cornerRadius={0.03}
          shadowOpacity={0.6}
          chromaticAberrationIntensity={0.002}
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
