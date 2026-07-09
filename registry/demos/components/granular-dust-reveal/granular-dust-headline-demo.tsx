import { GranularDustReveal } from "@/registry/ui/granular-dust-reveal"
export default function GranularDustHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <GranularDustReveal
          as="h1"
          text="Coalescing matter."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          splitBy="char"
          startingDisplacement={100} // Extra aggressive static scattering
          delay={0.2}
          duration={1.5}
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
