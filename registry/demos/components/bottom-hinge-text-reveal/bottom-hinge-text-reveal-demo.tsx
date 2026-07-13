import { BottomHingeTextReveal } from "@/registry/ui/bottom-hinge-text-reveal"

export default function BottomHingeTextRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <BottomHingeTextReveal
          as="h1"
          text="Hard impact."
          className="text-6xl leading-[1] font-bold tracking-tighter md:text-9xl"
          splitBy="char"
          delay={0.2}
          duration={2}
          stagger={0.06} // A slightly slower stagger lets you feel the individual weight of each hinge swing
        />
      </div>
    </main>
  )
}
