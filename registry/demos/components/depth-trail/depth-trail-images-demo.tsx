import DepthTrail from "@/registry/ui/depth-trail"

// Optimized Cloudinary URLs (w_250) for fast sequential loading
const trailImages = [
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/14.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/17.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/18.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/19.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/20.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/21.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/22.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/23.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/24.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/25.jpg",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/26.jpg",
]

export default function DepthTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Cinematic Depth.
        </h1>
      </div>

      <DepthTrail
        imageUrls={trailImages}
        distance={300}
        maxItems={25}
        duration={2400}
        itemSize={90}
        rotationRange={45}
        // Framing the images nicely with a white border
        itemClassName="border-4 border-white/90 shadow-xl"
      />
    </main>
  )
}
