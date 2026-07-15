import { WindShearReveal } from "@/registry/ui/wind-shear-reveal"

export default function WindShearDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <WindShearReveal
          as="h1"
          text="Velocity meets friction."
          className="text-5xl leading-[0.9] font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]"
          splitBy="char" // Switching to "char" looks incredibly sleek on this short headline
          delay={0.2}
          duration={1.2}
          stagger={0.08}
          startingSkew={-35} // Slightly heavier lean to emphasize speed
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
