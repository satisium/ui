import { WeightlessFloatReveal } from "@/registry/ui/weightless-float-reveal" // Update path as needed

export default function WeightlessFloatParagraphDemo() {
  return (
    <main className="h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* The Reveal Container */}
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-5xl px-6 text-left md:text-justify">
          <WeightlessFloatReveal
            as="h2"
            text="You wear your honour like a suit of armour, Stark. You think it keeps you safe, but all it does is weigh you down and make it hard for you to move."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word" // Splitting by word keeps the paragraph legible while drifting
            startYMin={20} // Subtler vertical drift for body text
            startYMax={50}
            startRotationMin={-3} // Very gentle tilt
            startRotationMax={3}
            duration={2.5}
            stagger={0.04} // A faster stagger so the reading flow isn't interrupted
            viewportOnce={false} // Will replay beautifully when scrolled in/out of view
          />
        </div>
      </div>
    </main>
  )
}
