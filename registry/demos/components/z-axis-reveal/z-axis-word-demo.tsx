import { ZAxisReveal } from "@/registry/ui/z-axis-reveal"

export default function ZAxisWordDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      <section className="flex w-full items-center justify-center px-6">
        <div className="max-w-6xl">
          <ZAxisReveal
            as="h2"
            splitBy="word"
            pin={true} // THE HOLY GRAIL OF UX
            startScale={4} // Extreme depth
            blur={true}
            momentum={1.5}
            text="People work together, when it suits them. They're loyal, when it suits them. They love each other, when it suits them. And they kill each other, when it suits them."
            className="text-4xl leading-[1.3] font-medium tracking-tight md:text-6xl"
          />
        </div>
      </section>

      {/* Spacer to allow scrolling past the pinned section */}
      <section className="h-screen w-full" />
    </main>
  )
}
