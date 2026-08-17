
import { MultiColorTrailReveal } from "@/components/home/multi-color-trail-reveal" // Adjust path as needed

export function IntroSection() {
  const manifesto = `Satisium UI is a collection of meticulously crafted components, blocks, and templates by Satisium.\n\nFully compatible with shadcn/ui themes. Simply copy the code, drop it into your project, and watch it work flawlessly.\n\nThe entire library is open-source. Explore, modify, contribute, and build.`

  return (
    <section className="relative w-full bg-muted py-40 md:py-48 lg:py-64">
      <div className="mx-auto w-full max-w-4xl px-6 md:px-12 2xl:max-w-5xl">
        <MultiColorTrailReveal
          text={manifesto}
          as="h2"
          splitBy="char"
          edge="soft"
          mutedClassName="text-muted-foreground/15"
          trailColors={[
            "text-red-500/60",
            "text-orange-500/80",
            "text-yellow-400/90",
          ]}
          finalClassName="text-foreground"
          className="font-heading text-2xl leading-[1.5] font-medium sm:text-3xl md:text-4xl lg:text-5xl"
          momentum={3.5}
          pin={true}
        />
      </div>
    </section>
  )
}