import SquircleTrail from "@/registry/ui/squircle-trail"

const trailImages = [
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/14.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/17.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/18.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/19.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/20.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/21.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/22.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/23.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/24.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/25.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/26.webp",
]

export default function SquircleTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Squircles.
        </h1>
      </div>

      <SquircleTrail
        imageUrls={trailImages}
        distance={30}
        itemSize={120}
        maxItems={7}
        duration={1200}
        rotationRange={15}
        directionalRotation={false}
        itemClassName="border-4 border-border"
      />
    </main>
  )
}
