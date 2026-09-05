import PendulumTrail from "@/registry/ui/pendulum-trail"

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

export default function PendulumTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Pendulum.
        </h1>
      </div>

      <PendulumTrail
        imageUrls={trailImages}
        distance={80}
        duration={3200} // Let the photos drift a little longer
        maxItems={12} // Fewer photos so the screen doesn't get overly cluttered
        itemSize={130}
        windAngle={-5} // Mild left wind
        windSway={8} // High ambient flutter
        physicsLength={60} // Slower, heavier swing
        itemClassName="border-4 border-border rounded-2xl overflow-hidden" // Thick polaroid border look
      />
    </main>
  )
}
