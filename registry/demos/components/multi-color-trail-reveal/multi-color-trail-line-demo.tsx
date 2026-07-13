import { MultiColorTrailReveal } from "@/registry/ui/multi-color-trail-reveal"

const text1 =
  "“Can a man still be brave if he's afraid?” Asked Bran.\n“That is the only time a man can be brave,” says Ned."
const text2 =
  "“What is honor compared to a woman's love?\nWhat is duty against the feel of a newborn son in your arms . . .\nor the memory of a brother's smile? Wind and words. Wind and words.\nWe are only human, and the gods have fashioned us for love.\nThat is our great glory, and our great tragedy.”"
const text3 =
  "“Never forget what you are, for surely the world will not.\nMake it your strength. Then it can never be your weakness.\nArmour yourself in it, and it will never be used to hurt you.”"

export default function MultiColorTrailLineDemo() {
  return (
    <main className="w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest text-primary uppercase">
          Line Mode
        </span>
        <span className="text-xs">Scroll to unveil</span>
        <div className="mt-8 h-16 w-[1px] bg-border" />
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-zinc-400 uppercase">
            01 // Line × Soft
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="line"
            edge="soft"
            text={text1}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={1}
            trailColors={["text-zinc-400", "text-zinc-100"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-cyan-500 uppercase">
            02 // Line × Liquid
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="line"
            edge="liquid"
            text={text2}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={2}
            trailColors={["text-sky-500", "text-cyan-300"]}
          />
        </div>
      </section>

      <section className="block w-full py-[25vh]">
        <div className="mx-auto max-w-4xl px-6 text-left">
          <p className="mb-6 font-mono text-xs font-medium tracking-widest text-indigo-500 uppercase">
            03 // Line × Hard
          </p>
          <MultiColorTrailReveal
            as="h2"
            splitBy="line"
            edge="hard"
            text={text3}
            className="text-4xl leading-[1.35] font-medium tracking-tight md:text-5xl"
            trailLength={1}
            trailColors={["text-indigo-500", "text-blue-400"]}
          />
        </div>
      </section>

      <section className="h-[30vh] w-full" />
    </main>
  )
}
