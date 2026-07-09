import { GranularDustReveal } from "@/registry/ui/granular-dust-reveal"
export default function GranularDustParagraphDemo() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* The Reveal Container */}
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="max-w-5xl text-left md:text-justify">
          <GranularDustReveal
            as="h2"
            text="Why do we fall, sir? So that we can learn to pick ourselves up."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word"
            triggerStart="top 85%"
            startingDisplacement={60} // Softer static for paragraphs
            duration={1.2}
            stagger={0.03}
            viewportOnce={false} // Effortlessly reverses when scrolling away
          />
        </div>
      </div>
    </main>
  )
}
