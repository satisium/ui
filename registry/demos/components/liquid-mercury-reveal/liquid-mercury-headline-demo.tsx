import { LiquidMercuryReveal } from "@/registry/ui/liquid-mercury-reveal" // Update path as needed

export default function LiquidMercuryHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <LiquidMercuryReveal
          as="h1"
          text="Elastic physics."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          startingBlur={12}
          delay={0.2}
          duration={2.5} // Long duration allows the heavy elastic snapping to settle
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
