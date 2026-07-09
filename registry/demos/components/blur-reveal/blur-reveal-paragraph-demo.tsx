import { BlurReveal } from "@/registry/ui/blur-reveal"

export default function BlurRevealParagraphDemo() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      {/* The Reveal Container */}
      <div className="flex w-full items-center justify-center px-6 pt-[90vh] pb-[25vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <BlurReveal
            as="h2"
            text="We craft highly polished, satisfying interfaces that feel awesome, seamlessly fluid, and entirely effortless. Everything serves a purpose."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="char"
            blur={true}
            triggerStart="top 85%"
            duration={1.2}
            stagger={0.03} // Fast cascade for readability
            ease="power3.out"
            viewportOnce={false} // Effortlessly reverses when scrolling away
          />
        </div>
      </div>
    </main>
  )
}
