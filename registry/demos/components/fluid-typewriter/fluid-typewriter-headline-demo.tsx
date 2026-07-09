import { FluidTypewriter } from "@/registry/ui/fluid-typewriter"

export default function FluidTypewriterHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <FluidTypewriter
          as="h1"
          text="Seamless fluidity."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          baseSpeed={0.05} // Slightly slower for headlines
          variance={0.03}
          delay={0.3}
          cursorClassName="bg-primary shadow-[0_0_20px_var(--primary)]"
        />
      </div>
    </main>
  )
}
