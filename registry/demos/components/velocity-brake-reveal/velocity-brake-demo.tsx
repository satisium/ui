import { VelocityBrakeReveal } from "@/registry/ui/velocity-brake-reveal"

export default function VelocityBrakeDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-5xl px-6 text-center">
        <VelocityBrakeReveal
          as="h1"
          text="Momentum & Friction."
          className="text-6xl leading-[1.1] font-black tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={0.8} // Fast duration accentuates the "slamming" of the brakes
          stagger={0.03} // Ultra-fast stagger makes it feel like one unified train stopping
          startSkew={-30} // Extreme wind resistance tilt
          startX="-4em" // Long slide-in distance generates high velocity
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
