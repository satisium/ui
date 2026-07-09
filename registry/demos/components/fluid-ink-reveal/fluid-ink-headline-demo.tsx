import { FluidInkReveal } from "@/registry/ui/fluid-ink-reveal" // Update path as needed

export default function FluidInkHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <FluidInkReveal
          as="h1"
          text="Surface tension."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          splitBy="char"
          startBlur="32px"
          delay={0.2}
          duration={1.5}
          stagger={0.08}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
