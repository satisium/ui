import { MultiColorTrailReveal } from "@/registry/ui/multi-color-trail-reveal"

const text1 =
  "“Can a man still be brave if he's afraid?” Asked Bran.\n“That is the only time a man can be brave,” says Ned."
const text2 =
  "“What is honor compared to a woman's love? What is duty against the feel of a newborn son in your arms . . . or the memory of a brother's smile? Wind and words. Wind and words. We are only human, and the gods have fashioned us for love. That is our great glory, and our great tragedy.”"
const text3 =
  "“Never forget what you are, for surely the world will not. Make it your strength. Then it can never be your weakness. Armour yourself in it, and it will never be used to hurt you.”"

export default function MultiColorTrailCharDemo() {
  return (
    <main className="w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest text-primary uppercase">
          Character Mode
        </span>
        <span className="text-xs">Scroll slowly to spell</span>
        <div className="mt-8 h-16 w-[1px] bg-border" />
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-emerald-500 uppercase">
            01 // Char × Soft
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="char"
            edge="soft"
            text={text1}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={16}
            trailColors={["text-emerald-500", "text-teal-400", "text-cyan-400"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-violet-500 uppercase">
            02 // Char × Liquid
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="char"
            edge="liquid"
            text={text2}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={12}
            trailColors={[
              "text-violet-600",
              "text-fuchsia-500",
              "text-pink-400",
            ]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-amber-500 uppercase">
            03 // Char × Hard
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="char"
            edge="hard"
            text={text3}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={10}
            trailColors={["text-amber-500", "text-yellow-400"]}
          />
        </div>
      </section>

      <section className="h-[30vh] w-full" />
    </main>
  )
}
