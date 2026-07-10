import { ManifestoTextReveal } from "@/registry/ui/manifesto-text-reveal"

export default function ManifestoTextRevealDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll slowly</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      {/* The Cinematic Reveal Section */}
      <section className="flex w-full items-center justify-center px-6">
        <div className="max-w-5xl text-left md:text-justify">
          <ManifestoTextReveal
            as="h2"
            text="It's like in the great stories, Mr. Frodo. The ones that really mattered. Full of darkness and danger, they were... But in the end, it's only a passing thing, this shadow. Even darkness must pass. A new day will come. And when the sun shines, it will shine out the clearer."
            className="text-4xl leading-[1.3] font-semibold tracking-tight md:text-5xl"
            splitLevel="character"
            scrub={2} // 2 seconds of fluid scroll inertia
            pin={true} // THE MAGIC: Locks the text on screen!
            inactiveOpacity={0.15}
            // Starts pinning & animating right when the center of the text hits the center of the viewport
            triggerStart="center center"
            // Gives the user 150% of the viewport's height worth of scrolling to finish reading
            triggerEnd="+=150%"
          />
        </div>
      </section>

      <section className="flex h-screen w-full flex-col items-center justify-center text-sm font-medium tracking-wide text-muted-foreground">
        <p>The end</p>
      </section>
    </main>
  )
}
