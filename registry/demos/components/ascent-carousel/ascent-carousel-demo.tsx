import { AscentCarousel } from "@/registry/ui/ascent-carousel"

const IMAGES = [
  {
    id: "1",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1782906341/ui-v3/demos/images/12.jpg",
  },
  {
    id: "2",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/13.jpg",
  },
  {
    id: "3",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/14.jpg",
  },
  {
    id: "4",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/15.jpg",
  },
  {
    id: "5",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/9.jpg",
  },
  {
    id: "6",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/17.jpg",
  },
  {
    id: "7",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/18.jpg",
  },
  {
    id: "8",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/19.jpg",
  },
  {
    id: "9",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/20.jpg",
  },
  {
    id: "10",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/21.jpg",
  },
  {
    id: "11",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/22.jpg",
  },
  {
    id: "12",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/24.jpg",
  },
  {
    id: "13",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/25.jpg",
  },
  {
    id: "14",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/26.jpg",
  },
]

export default function AscentCarouselDemo() {
  return (
    <main className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Top Half: Minimalist Instruction */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Grab, swipe, or scroll.
        </p>
      </section>

      {/* Bottom Half: Component Area */}
      <section className="relative h-[70vh] w-full">
        <AscentCarousel
          items={IMAGES}
          // --- MOBILE FIRST DEFAULTS ---
          visibleItems={4}
          maxHeight={300}
          minHeight={80}
          // --- RESPONSIVE OVERRIDES ---
          breakpoints={{
            640: { visibleItems: 6, maxHeight: 400, minHeight: 100 },
            1024: { visibleItems: 8, maxHeight: 500, minHeight: 120 },
            1280: { visibleItems: 8, maxHeight: 600, minHeight: 150 },
          }}
          autoMove={true}
          autoMoveType="continuous"
          autoMoveSpeed={0.005}
          scrollMultiplier={0.0002}
        />
      </section>
    </main>
  )
}
