import { ElasticTypewriter } from "@/registry/ui/elastic-typewriter"

export default function ElasticTypewriterHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <ElasticTypewriter
          as="h1"
          text="Tension & elasticity."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          delay={0.4}
          baseSpeed={0.05} // Slightly slower to emphasize the snap mechanics
          variance={0.03}
          cursorClassName="bg-primary"
        />
      </div>
    </main>
  )
}
