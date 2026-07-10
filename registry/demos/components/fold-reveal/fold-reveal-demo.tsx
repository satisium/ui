import { FoldReveal } from "@/registry/ui/fold-reveal"

export default function FoldRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <FoldReveal
          as="h1"
          text={"Architecture in \ndigital motion."}
          className="text-5xl leading-[0.9] font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]"
          delay={0.2}
          duration={1.4}
          stagger={0.2}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
