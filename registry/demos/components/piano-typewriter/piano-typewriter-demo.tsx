import { PianoTypewriter } from "@/registry/ui/piano-typewriter"

export default function PianoTypewriterDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-5xl px-6 text-center">
        <PianoTypewriter
          as="h1"
          text="Not all those who wander are lost."
          className="text-5xl leading-[1.1] font-bold tracking-tighter md:text-7xl lg:text-[5.5rem]"
          delay={0.2}
          baseSpeed={0.045} // Slightly slower to emphasize the 3D key physics
          variance={0.03}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
