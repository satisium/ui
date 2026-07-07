import { Flip3DReveal } from "@/registry/ui/flip-3d-reveal"

export default function Flip3DParagraphDemo() {
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
          <Flip3DReveal
            as="h2"
            text="Meticulously crafted components for modern web applications. Elevate your interface with uncompromising performance, accessibility, and refined design."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word" // Split by word ensures DOM performance on long text blocks
            triggerStart="top 85%"
            startAngle={80} // Slightly less extreme angle for body text
            startX="0em" // Removed horizontal slide for cleaner paragraph reading
            duration={0.7}
            stagger={0.03}
            viewportOnce={false} // Will seamlessly reverse and replay on scroll
          />
        </div>
      </div>
    </main>
  )
}
