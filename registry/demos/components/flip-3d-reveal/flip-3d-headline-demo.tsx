import { Flip3DReveal } from "@/registry/ui/flip-3d-reveal"
export default function Flip3DHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <Flip3DReveal
          as="h1"
          text="Spatial computing."
          className="text-6xl leading-[1.1] font-medium tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={1}
          stagger={0.04} // Rapid-fire mechanical stagger
        />
      </div>
    </main>
  )
}
