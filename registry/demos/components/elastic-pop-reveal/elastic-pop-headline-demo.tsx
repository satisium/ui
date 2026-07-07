import { ElasticPopReveal } from "@/registry/ui/elastic-pop-reveal"

export default function ElasticPopHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <ElasticPopReveal
          as="h1"
          text="Fluid physics. Tactile typography."
          className="text-5xl leading-[1.1] font-black tracking-tighter md:text-7xl lg:text-8xl"
          delay={0.1}
          splitBy="char"
          startScale={0.5}
          duration={1.8}
          stagger={0.03}
          ease="elastic.out(1.2, 0.3)" // High amplitude, loose frequency for dramatic bounce
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
