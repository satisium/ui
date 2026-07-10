import { MaskedReveal } from "@/registry/ui/masked-reveal"

export default function MaskedRevealParagraphDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator / Spacer to push the reveal down */}
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to reveal</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      {/* The Multiline Reveal Section */}
      <section className="flex w-full items-center justify-center px-6 pb-32">
        <div className="max-w-4xl text-left md:text-justify">
          <MaskedReveal
            as="h2"
            text="Many that live deserve death. And some that die deserve life. Can you give it to them? Then do not be too eager to deal out death in judgement. For even the very wise cannot see all ends."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl md:leading-[1.3]"
            splitBy="word" // 'word' is best for large blocks of text
            delay={0.1}
            stagger={0.02} // Faster stagger for multiline so the user isn't waiting forever
            startOffset="100%"
            startRotation={8}
            viewportOnce={false}
          />
        </div>
      </section>

      {/* Bottom spacer to allow natural scrolling past the component */}
      <section className="h-[50vh] w-full" />
    </main>
  )
}
