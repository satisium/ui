"use client"

import { PanoramicCarousel } from "@/registry/ui/panoramic-carousel"

export default function PanoramicCarouselDemo() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      {/* 
        The Carousel spans the entire screen absolutely, allowing the user to interact 
        from any point on the canvas for a highly immersive experience.
      */}
      <div className="absolute inset-0 z-0">
        <PanoramicCarousel
          images={images}
          // --- Customizing the Spatial Properties ---
          radiusMultiplier={1.5}
          gapMultiplier={1.05} // Tighter gaps
          depthMultiplier={1.2} // Pushes the outer cards closer to the camera
          // --- Customizing the Camera Speed FX ---
          baseFov={40} // Starts slightly zoomed in
          maxFovZoom={1000} // Allows massive zoom-out on fast swipes
          fovMultiplier={5}
          // --- Customizing Shader FX ---
          motionBlurIntensity={0.005} // Heavier blur smear
          flexMultiplier={0.1} // More elastic bending on the edges
          cornerRadius={0.06} // Rounder corners
          // --- Theme-Agnostic Fog ---
          fadeEdge1={0.4} // Starts fading earlier
          fadeEdge2={1.2} // Fades to 0 opacity faster (hides peripheral pop-in)
          scrollSensitivity={0.001}
          parallaxIntensity={1.2}
          chromaticAberrationIntensity={0.02}
        />
      </div>

      <div className="pointer-events-none absolute bottom-12 z-10 flex w-full flex-col items-center justify-center gap-2 text-center select-none">
        <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Swipe Horizontally
        </div>
        <p className="text-xs text-muted-foreground/60">
          The cards wrap inward to surround your peripheral vision
        </p>
      </div>
    </main>
  )
}
