import { HeatMirageReveal } from "@/registry/ui/heat-mirage-reveal"
export default function HeatMirageHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <HeatMirageReveal
          as="h1"
          text="Thermal dynamics."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          startingDisplacement={40} // High displacement for a heavy mirage
          delay={0.2}
          duration={2.5}
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
