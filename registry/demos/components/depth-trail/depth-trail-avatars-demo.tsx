import DepthTrail from "@/registry/ui/depth-trail"

// Optimized Cloudinary URLs (w_250) for ultra-fast, lightweight trail rendering
const trailImages = [
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/16.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/17.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/18.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/19.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/20.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/21.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/22.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/23.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/24.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/25.png",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/avatars/mono/26.png",
]

export default function DepthTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Cinematic Depth.
        </h1>
      </div>

      <DepthTrail
        imageUrls={trailImages}
        // Dense spacing allows cards to group up and contrast their depth
        distance={300}
        // Generous limit to populate the 3D space fully
        maxItems={25}
        // Extended lifespan so you can admire the upward drift and parallax
        duration={2400}
        itemSize={90}
        // Higher rotation adds to the chaotic floating particle look
        rotationRange={45}
      />
    </main>
  )
}
