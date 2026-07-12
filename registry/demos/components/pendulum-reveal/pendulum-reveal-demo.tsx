import { PendulumReveal } from "@/registry/ui/pendulum-reveal"

export default function PendulumRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <PendulumReveal
          as="h1"
          text="Kinetic typography."
          className="text-6xl leading-[1.1] font-bold tracking-tighter drop-shadow-2xl md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={1.8}
          stagger={0.05}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
