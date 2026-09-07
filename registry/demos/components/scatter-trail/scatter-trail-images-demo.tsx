import ScatterTrail from "@/registry/ui/scatter-trail"

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

export default function ScatterTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Scatter Cards.
        </h1>
      </div>

      <ScatterTrail
        imageUrls={trailImages}
        distance={45} // Slightly wider spacing for large photos
        itemSize={130} // Larger polaroid style
        maxItems={20}
        duration={1600} // Longer slide
        slideMultiplier={150} // More dramatic slide based on velocity
        maxSlide={500}
        scatterSpread={0.8} // Wider angle variance
        itemClassName="border-4 border-border" // Distinct photo frame look
      />
    </main>
  )
}
