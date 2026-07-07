import { ElasticPopReveal } from "@/registry/ui/elastic-pop-reveal"

export default function ElasticPopParagraphDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      {/* The Reveal Container */}
      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-center">
          <ElasticPopReveal
            as="h2"
            text="Meticulously crafted components for modern web applications. Elevate your interface with uncompromising performance, accessibility, and refined design."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word" // Splitting by word ensures performance on long paragraphs
            triggerStart="top 85%"
            startScale={0.8} // Subtler pop for body text
            startOpacity={0}
            duration={1.2}
            stagger={0.02} // Fast flow for readability
            ease="elastic.out(1, 0.5)" // Tighter spring
            viewportOnce={false} // Will seamlessly reverse and replay on scroll
          />
        </div>
      </div>
    </main>
  )
}
