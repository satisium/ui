import { FluidTypewriter } from "@/registry/ui/fluid-typewriter"

export default function FluidTypewriterParagraphDemo() {
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
          <FluidTypewriter
            as="h2"
            text="Notice how the cursor glides, gracefully wraps to new lines, and organically hesitates at punctuation marks. It feels less like a machine, and more like a thought forming in real time."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            triggerStart="top 85%"
            baseSpeed={0.05}
            variance={0.03}
            cursorClassName="bg-primary shadow-[0_0_15px_var(--primary)]"
            viewportOnce={true}
          />
        </div>
      </div>
    </main>
  )
}
