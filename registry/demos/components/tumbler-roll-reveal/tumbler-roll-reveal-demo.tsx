import { TumblerRollReveal } from "@/registry/ui/tumbler-roll-reveal"

export default function TumblerRollRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-5xl px-6 text-center">
        <TumblerRollReveal
          as="h1"
          text="Winter is coming !!!"
          className="text-4xl leading-[1.2] font-bold tracking-tight md:text-6xl lg:text-7xl"
          splitBy="char"
          delay={0.2}
          duration={0.9}
          stagger={0.02} // Fast mechanical sweep
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
