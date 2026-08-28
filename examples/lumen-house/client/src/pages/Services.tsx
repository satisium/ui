// Design system reminder: Shared Satisium UI grammar — full-screen neutral statements, rounded modules, sans hierarchy and primary-orange intent.

import { EditorialReveal } from "@/components/satisium-ui/editorial-reveal";
import { ApertureOrbit } from "@/components/studio/ApertureOrbit";
import { SectionHeading } from "@/components/studio/SectionHeading";
import { StudioShell } from "@/components/studio/StudioShell";
import { processSteps, services } from "@/content/site";
import { Link } from "wouter";

export default function Services() {
  return (
    <StudioShell>
      <main className="space-y-3 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
        <section className="relative overflow-hidden rounded-[1.4rem] bg-background px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <ApertureOrbit className="pointer-events-none absolute -top-32 -right-24 size-[460px] text-foreground opacity-70 lg:size-[620px]" />
          <div className="relative z-10 mx-auto max-w-[1440px]">
            <p className="inline-flex items-center gap-2 font-mono text-[10px] text-primary uppercase">
              <span className="size-1.5 rounded-full bg-primary" />
              Services / Studio practice
            </p>
            <EditorialReveal
              as="h1"
              text="The work around the work matters."
              blockClassName="bg-primary"
              duration={0.55}
              stagger={0.04}
              reverseOnScroll={false}
              className="mt-6 max-w-5xl font-sans text-5xl font-extrabold leading-[0.9] tracking-[-0.06em] sm:text-7xl"
            />
            <p className="mt-8 max-w-xl font-sans text-base leading-7 text-muted-foreground">
              Every brief gets a clear process. The production can be quiet; the
              intention should never be vague.
            </p>
          </div>
        </section>
        <section className="rounded-[1.4rem] bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading index="01 / COMMISSION" title="Choose a way in." />
            <div className="mt-12 grid gap-10 lg:grid-cols-[0.42fr_1fr]">
              <aside className="self-start overflow-hidden rounded-[1.4rem] bg-foreground p-4 text-background shadow-sm lg:sticky lg:top-24">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85"
                    alt="Hands holding a camera during a production"
                    className="aspect-[3/4] w-full rounded-xl object-cover"
                  />
                </div>
                <p className="mt-4 font-mono text-[10px] text-background/65 uppercase">
                  Process note / set 14
                  <br />
                  <span className="text-primary">Hands, light, timing</span>
                </p>
              </aside>
              <div className="space-y-3">
                {services.map(service => (
                  <article
                    key={service.index}
                    className="grid gap-5 rounded-[1.4rem] bg-background p-6 shadow-sm md:grid-cols-[92px_1fr_0.75fr]"
                  >
                    <p className="font-mono text-[11px] text-primary">
                      {service.index}
                    </p>
                    <div>
                      <h3 className="font-sans text-3xl font-bold tracking-tight">
                        {service.title}
                      </h3>
                      <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-muted-foreground">
                        {service.copy}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] leading-6 text-muted-foreground uppercase">
                      {service.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading
              index="02 / PROCESS"
              title="A useful amount of structure."
              copy="Enough to make good decisions early. Enough space to notice something better when it arrives."
            />
            <ol className="mt-12 grid gap-3 md:grid-cols-4">
              {processSteps.map(([number, title, copy]) => (
                <li key={number} className="rounded-[1.4rem] bg-muted p-6">
                  <span className="font-mono text-[10px] text-primary">
                    {number}
                  </span>
                  <h3 className="mt-10 font-sans text-2xl font-bold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-6 text-muted-foreground">
                    {copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12">
          <p className="font-sans text-4xl font-bold tracking-tight">
            Have a <span className="text-primary">brief</span> in mind?
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 font-sans text-xs font-semibold text-primary-foreground outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Send the first note →
          </Link>
        </section>
      </main>
    </StudioShell>
  );
}
