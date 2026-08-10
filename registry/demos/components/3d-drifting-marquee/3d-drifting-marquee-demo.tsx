"use client"

import ThreeDDriftingMarquee from "@/registry/ui/3d-drifting-marquee"

const IMAGES = [
  {
    id: "1",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1782906341/ui-v3/demos/images/12.jpg",
    alt: "Demo image 1",
  },
  {
    id: "2",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/13.jpg",
    alt: "Demo image 2",
  },
  {
    id: "3",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/14.jpg",
    alt: "Demo image 3",
  },
  {
    id: "4",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/15.jpg",
    alt: "Demo image 4",
  },
  {
    id: "5",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/9.jpg",
    alt: "Demo image 5",
  },
  {
    id: "6",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/17.jpg",
    alt: "Demo image 6",
  },
  {
    id: "7",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/18.jpg",
    alt: "Demo image 7",
  },
  {
    id: "8",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/19.jpg",
    alt: "Demo image 8",
  },
]

export default function ThreeDDriftingMarqueeDemo() {
  return (
    <main className="flex h-screen w-full flex-col bg-background text-foreground">
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Drag to spin, scroll to accelerate, hover to wave.
        </p>
      </section>

      <section className="relative h-[60vh] w-full">
        <ThreeDDriftingMarquee
          images={IMAGES}
          cardWidth={320}
          cardHeight={240}
          gap={-140}
          defaultVelocity={0.8}
          maxSkew={12}
          dragFactor={1.0}
          enableEntry={true}
          entryAnimationDelay={0.3}
          entryAnimationDuration={2.0}
          entryDistance={1500}
          enableWave={true}
          waveHeight={35}
          waveProximity={2}
        />
      </section>
    </main>
  )
}
