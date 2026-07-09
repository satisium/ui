import { FluidInkReveal } from "@/registry/ui/fluid-ink-reveal" // Update path as needed

export default function FluidInkParagraphDemo() {
  return (
    <main className="relative min-h-[150vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      {/* The Reveal Container */}
      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <FluidInkReveal
            as="h2"
            text="Don't let yourself get attached to anything you are not willing to walk out on in 30 seconds flat if you feel the heat around the corner."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="char"
            triggerStart="top 85%"
            startBlur="16px"
            duration={1.2}
            stagger={0.06}
            viewportOnce={false}
          />
        </div>
      </div>
    </main>
  )
}
