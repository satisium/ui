import { WeightlessFloatReveal } from "@/registry/ui/weightless-float-reveal" // Update path as needed

export default function WeightlessFloatDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <WeightlessFloatReveal
          as="h1"
          text="Defying gravity."
          className="text-5xl leading-[0.9] font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]"
          splitBy="char"
          startYMin={40}
          startYMax={80}
          startRotationMin={-8}
          startRotationMax={8}
          delay={0.2}
          duration={2.5}
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
