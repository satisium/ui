import { MagneticSnapReveal } from "@/registry/ui/magnetic-snap-reveal"

export default function MagneticSnapDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <MagneticSnapReveal
          as="h1"
          text="Chaos into order."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={1.2}
          stagger={0.03}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
