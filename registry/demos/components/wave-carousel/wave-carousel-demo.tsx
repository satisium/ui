import { WaveCarousel } from "@/registry/ui/wave-carousel"

const IMAGES = [
  {
    id: "1",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/12.webp",
  },
  {
    id: "2",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/13.webp",
  },
  {
    id: "3",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/14.webp",
  },
  {
    id: "4",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/15.webp",
  },
  {
    id: "5",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/9.webp",
  },
  {
    id: "6",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/17.webp",
  },
  {
    id: "7",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/18.webp",
  },
  {
    id: "8",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/19.webp",
  },
  {
    id: "9",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/20.webp",
  },
  {
    id: "10",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/21.webp",
  },
  {
    id: "11",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/22.webp",
  },
  {
    id: "12",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/24.webp",
  },
  {
    id: "13",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/25.webp",
  },
  {
    id: "14",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/26.webp",
  },
]

export default function WaveCarouselDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Half: Minimalist Instruction */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Grab, swipe, or scroll.
        </p>
      </section>

      {/* Bottom Half: Responsive Component Area */}
      <section className="relative h-[45vh] w-full md:h-[55vh]">
        <WaveCarousel
          items={IMAGES}
          waves={1.5} // Number of repeating "hills" visible on screen at once
          // --- MOBILE FIRST DEFAULTS ---
          visibleItems={5}
          maxHeight={300}
          minHeight={100}
          // --- RESPONSIVE OVERRIDES ---
          breakpoints={{
            640: { visibleItems: 5, maxHeight: 400, minHeight: 120 },
            1024: { visibleItems: 7, maxHeight: 500, minHeight: 150 },
            1280: { visibleItems: 7, maxHeight: 600, minHeight: 180 },
          }}
          autoMove={true}
          autoMoveType="continuous"
          autoMoveSpeed={0.005} // Smooth glide over the rolling hills
          scrollMultiplier={0.0002}
        />
      </section>
    </main>
  )
}
