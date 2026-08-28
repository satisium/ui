// Design system reminder: Shared Satisium UI grammar — content is grouped in padded rounded shells, neutral grid structure and compact mono metadata rather than loose editorial masonry.

import { StudioShell } from "@/components/studio/StudioShell";
import { journalEntries } from "@/content/site";
import { Link } from "wouter";

function NoteCard({
  entry,
  feature = false,
}: {
  entry: (typeof journalEntries)[number];
  feature?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[1.4rem] bg-muted ${feature ? "grid min-h-0 lg:grid-cols-[0.9fr_1.1fr]" : "grid min-h-0 sm:grid-cols-[0.76fr_1.24fr]"}`}
    >
      <img
        src={entry.image}
        alt={entry.alt}
        className={`h-full w-full object-cover ${feature ? "aspect-[4/3] lg:order-last lg:aspect-auto" : "aspect-[4/3] sm:aspect-auto"}`}
      />
      <div
        className={`flex min-w-0 flex-col ${feature ? "p-6 sm:p-8 lg:p-10" : "p-6"}`}
      >
        <p className="font-mono text-[10px] text-primary uppercase">
          {entry.date}
          <br />
          {entry.category}
        </p>
        <h2
          className={`${feature ? "mt-10 text-3xl sm:text-4xl" : "mt-7 text-2xl"} font-sans font-bold tracking-tight`}
        >
          {entry.title}
        </h2>
        <p className="mt-4 max-w-lg font-sans text-sm leading-7 text-muted-foreground">
          {entry.copy}
        </p>
        <Link href="/contact" className="mt-auto pt-7">
          <span className="inline-flex min-h-10 items-center rounded-xl bg-background px-4 font-sans text-xs font-semibold outline-offset-4 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
            Read note →
          </span>
        </Link>
      </div>
    </article>
  );
}

export default function Journal() {
  const [featured, ...notes] = journalEntries;
  return (
    <StudioShell>
      <main className="space-y-3 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
        <section className="mx-auto max-w-[1440px] rounded-[1.4rem] bg-background px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="grid gap-6 rounded-[1.2rem] bg-muted p-6 sm:p-8 lg:grid-cols-[1fr_0.75fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] text-primary">FIELD NOTES</p>
              <h1 className="mt-4 max-w-2xl font-sans text-[clamp(3rem,5.4vw,5.7rem)] font-extrabold leading-[0.88] tracking-[-0.065em]">
                Notes from the room.
              </h1>
            </div>
            <p className="max-w-md font-sans text-sm leading-6 text-muted-foreground">
              Small observations on light, pacing and the decisions that sit
              behind the final image.
            </p>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <NoteCard entry={featured} feature />
            <div className="grid gap-5">
              {notes.map(entry => (
                <NoteCard key={entry.title} entry={entry} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </StudioShell>
  );
}
