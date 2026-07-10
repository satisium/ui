import { MaskedReveal } from "@/registry/ui/masked-reveal"

export default function MaskedRevealHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center md:text-left">
        {/* Main Headline Reveal */}
        <MaskedReveal
          as="h1"
          text="Crafting highly polished, interactive digital experiences."
          className="text-5xl leading-[1.1] font-semibold tracking-tighter md:text-7xl"
          delay={0.2}
          stagger={0.04}
          splitBy="char"
          startOffset="120%"
        />
      </div>
    </main>
  )
}
