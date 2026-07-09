import { BlurReveal } from "@/registry/ui/blur-reveal"

export default function BlurRevealHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <BlurReveal
          as="h1"
          text="Motion creates emotion."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          blur={true}
          delay={0.2}
          duration={1.2}
          stagger={0.04}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
