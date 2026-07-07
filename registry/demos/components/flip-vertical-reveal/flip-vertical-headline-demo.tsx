import { FlipVerticalReveal } from "@/registry/ui/flip-vertical-reveal"

export default function FlipVerticalHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <FlipVerticalReveal
          as="h1"
          text="Elevating the standard."
          className="text-6xl leading-[1.1] font-semibold tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={0.9}
          stagger={0.04} // A rapid cascade creates a beautiful mechanical rippling effect
        />
      </div>
    </main>
  )
}
