import { ConcaveCarousel } from "@/registry/ui/concave-carousel"

const IMAGES = [
  {
    id: "1",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/12.jpg",
  },
  {
    id: "2",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/13.jpg",
  },
  {
    id: "3",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/14.jpg",
  },
  {
    id: "4",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/15.jpg",
  },
  {
    id: "5",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/9.jpg",
  },
  {
    id: "6",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/17.jpg",
  },
  {
    id: "7",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/18.jpg",
  },
  {
    id: "8",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/19.jpg",
  },
  {
    id: "9",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/20.jpg",
  },
  {
    id: "10",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/21.jpg",
  },
  {
    id: "11",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/22.jpg",
  },
  {
    id: "12",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/24.jpg",
  },
  {
    id: "13",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/25.jpg",
  },
  {
    id: "14",
    url: "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/26.jpg",
  },
]

export default function ConcaveCarouselDemo() {
  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top Half: Minimalist Instruction */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
          Interact with the carousel
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Grab, swipe, or scroll to explore physics-based momentum perfectly
          constrained in an edge-to-edge flush layout.
        </p>
      </section>

      {/* Bottom Half: Component Area */}
      <section className="relative h-[50vh] w-full">
        <ConcaveCarousel
          items={IMAGES}
          // --- MOBILE FIRST DEFAULTS ---
          visibleItems={3}
          maxHeight={200}
          minHeight={100}
          // --- RESPONSIVE OVERRIDES ---
          breakpoints={{
            640: { visibleItems: 5, maxHeight: 250, minHeight: 120 }, // sm (Tablets)
            1024: { visibleItems: 7, maxHeight: 350, minHeight: 150 }, // lg (Laptops)
            1280: { visibleItems: 9, maxHeight: 400, minHeight: 150 }, // xl (Desktop)
          }}
          autoMoveSpeed={0.005}
          scrollMultiplier={0.0003} // Extremely fluid on touch screens naturally
        />
      </section>
    </main>
  )
}
