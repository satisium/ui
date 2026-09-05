import ScatterTrail from "@/registry/ui/scatter-trail"

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
