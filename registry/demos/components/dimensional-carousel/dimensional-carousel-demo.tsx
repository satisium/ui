"use client"

import { DimensionalCarousel } from "@/registry/ui/dimensional-carousel"

export default function DimensionalCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* 
        The Carousel spans the entire screen absolutely, allowing the user to interact 
        from any point on the screen while the cards stay beautifully constrained in the center.
      */}
      <div className="absolute inset-0 z-0">
        <DimensionalCarousel
          images={images}
          bendMultiplier={0.05}
          scrollSensitivity={0.02}
          rgbSplitStrength={0.003}
        />
      </div>

      <div className="pointer-events-none absolute bottom-12 left-1/2 z-10 -translate-x-1/2 text-xs font-semibold tracking-[0.2em] text-muted-foreground/40 uppercase select-none">
        Scroll / Swipe
      </div>
    </main>
  )
}
