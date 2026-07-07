import { FlipVerticalReveal } from "@/registry/ui/flip-vertical-reveal"

export default function FlipVerticalParagraphDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      {/* The Reveal Container */}
      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <FlipVerticalReveal
            as="h2"
            text="Letters that don't just appear, but arrive. It brings a satisfying, mechanical rhythm to the screen, folding each character seamlessly into the viewport like a perfectly synchronized cascade."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="char" // Best for blocks of text to maintain readability
            triggerStart="top 85%"
            duration={0.8}
            stagger={0.015} // Slightly faster stagger for paragraphs so the narrative flows well
            viewportOnce={false} // Will replay as you scroll up and down
          />
        </div>
      </div>
    </main>
  )
}
