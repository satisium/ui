"use client"

import { FlexCarousel } from "@/registry/ui/flex-carousel"

export default function FlexCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Container spans full screen so interactions work from anywhere */}
      <div className="absolute inset-0 z-0">
        <FlexCarousel
          images={images}
          cardWidthRatio={0.35}
          gapMultiplier={0.36}
          flexMultiplier={0.25}
          rotationMultiplier={0.02}
          parallaxIntensity={0.6}
          chromaticAberrationIntensity={0.02}
          dimmingMultiplier={0.02}
          scrollSensitivity={0.01}
          cornerRadius={0.04}
        />
      </div>

      {/* Unobtrusive interactive cue */}
      <div className="pointer-events-none absolute bottom-8 z-10 text-center select-none">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Flick Horizontally
        </p>
      </div>
    </main>
  )
}
