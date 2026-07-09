import { HeatMirageReveal } from "@/registry/ui/heat-mirage-reveal"

export default function HeatMirageParagraphDemo() {
  return (
    <main className="h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* The Reveal Container */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-5xl text-left md:text-justify">
          <HeatMirageReveal
            as="h2"
            text="It starts as a haze, a distortion in the atmosphere. Slowly, the heat dissipates, the air cools, and the interface settles into perfect, crystalline focus."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word" // Split by word prevents the paragraph from becoming an unreadable noisy mess
            triggerStart="top 85%"
            startingDisplacement={25} // Subtler distortion for body text
            duration={2.5}
            stagger={0.04} // A slightly faster cascade for narrative flow
            viewportOnce={false} // Effortlessly reverses when scrolling away
          />
        </div>
      </div>
    </main>
  )
}
