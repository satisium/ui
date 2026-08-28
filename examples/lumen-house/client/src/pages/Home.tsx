// Design system reminder: Shared Satisium UI grammar — oversized editorial type, neutral rounded surfaces, orange intent, sparse utility detail and contained transform/opacity-only motion.

import { EditorialReveal } from "@/components/satisium-ui/editorial-reveal";
import { ApertureOrbit } from "@/components/studio/ApertureOrbit";
import { ProjectTile } from "@/components/studio/ProjectTile";
import { SectionHeading } from "@/components/studio/SectionHeading";
import { StudioFilm } from "@/components/studio/StudioFilm";
import { StudioShell } from "@/components/studio/StudioShell";
import { Button } from "@/components/ui/button";
import { journalEntries, projects, services } from "@/content/site";
import { ArrowRight, ArrowUpRight, Camera } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <StudioShell>
      <main className="space-y-3 px-3 pb-3 sm:space-y-5 sm:px-5 sm:pb-5">
        <section className="relative min-h-[min(790px,calc(100svh-100px))] overflow-hidden rounded-[1.4rem] bg-background px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <ApertureOrbit className="pointer-events-none absolute -top-28 -right-28 size-[470px] text-foreground sm:-top-20 sm:-right-16 lg:size-[650px]" />
          <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" /> PHOTOGRAPHY
              STUDIO
            </span>
            <span>EST. 2018</span>
          </div>
          <div className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 text-center sm:inset-x-10">
            <p className="mb-5 font-mono text-[11px] text-muted-foreground">
              PORTRAIT · CAMPAIGN · EVENT
            </p>
            <h1 className="text-balance font-sans text-[clamp(3.4rem,10vw,9.5rem)] font-extrabold leading-[0.84] tracking-[-0.075em] text-foreground">
              <span className="text-primary">Lumen</span> House
            </h1>
            <EditorialReveal
              as="p"
              text="A considered frame for the work that matters."
              blockClassName="bg-primary"
              duration={0.5}
              stagger={0.035}
              reverseOnScroll={false}
              className="mx-auto mt-7 max-w-xl text-balance font-sans text-lg font-medium leading-7 text-muted-foreground sm:text-xl"
            />
          </div>
          <div className="absolute right-5 bottom-5 left-5 z-10 flex flex-col justify-between gap-5 sm:right-8 sm:bottom-8 sm:left-8 sm:flex-row sm:items-end lg:right-12 lg:left-12">
            <Link href="/showcase">
              <Button className="h-12 rounded-xl bg-foreground px-5 font-sans text-xs font-semibold tracking-wide hover:bg-foreground/85">
                Explore the showcase <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-2 pr-4 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=360&q=85"
                alt="Portrait from a Lumen House photography session"
                className="size-12 rounded-xl object-cover"
              />
              <p className="font-mono text-[10px] leading-4 text-muted-foreground">
                CURRENTLY
                <br />
                <span className="text-foreground">LONDON / 2025</span>
              </p>
            </div>
          </div>
        </section>

        <StudioFilm />

        <section className="rounded-[1.4rem] bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading
              index="01 / SELECTED STORIES"
              title="Photography with a point of view."
              copy="A selection of portrait, campaign and event work, shaped for people and brands with a story already in motion."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {projects.slice(0, 3).map(project => (
                <div
                  key={project.id}
                  className="rounded-[1.4rem] bg-background p-3 shadow-sm"
                >
                  <ProjectTile project={project} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/showcase">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border bg-background px-5 font-sans text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  View the showcase <ArrowUpRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[10px] text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                02 / THE STUDIO
              </p>
              <h2 className="mt-5 max-w-sm font-sans text-4xl font-extrabold leading-[0.95] tracking-[-0.055em] sm:text-5xl">
                A clear process leaves room for the unexpected.
              </h2>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 font-mono text-[10px] text-muted-foreground">
                <Camera className="size-3.5 text-primary" /> SMALL CREW /
                INTENTIONAL SETS
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {services.map(service => (
                <article
                  key={service.index}
                  className="rounded-[1.4rem] bg-muted p-6"
                >
                  <p className="font-mono text-[10px] text-primary">
                    {service.index}
                  </p>
                  <h3 className="mt-12 font-sans text-xl font-bold tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-3 font-sans text-sm leading-6 text-muted-foreground">
                    {service.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.4rem] bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1440px]">
            <SectionHeading
              index="03 / FROM THE JOURNAL"
              title="Behind the final image."
              copy="Notes on process, place and the small production decisions that make a frame work."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {journalEntries.map(entry => (
                <article
                  key={entry.title}
                  className="overflow-hidden rounded-[1.4rem] bg-background shadow-sm"
                >
                  <img
                    src={entry.image}
                    alt={entry.alt}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-6">
                    <p className="font-mono text-[10px] text-primary">
                      {entry.date} / {entry.category}
                    </p>
                    <h3 className="mt-3 font-sans text-2xl font-bold tracking-tight">
                      {entry.title}
                    </h3>
                    <p className="mt-3 font-sans text-sm leading-6 text-muted-foreground">
                      {entry.copy}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[10px] text-primary">
                NEW WORK STARTS WITH A CONVERSATION
              </p>
              <h2 className="mt-4 max-w-3xl font-sans text-4xl font-extrabold leading-[0.95] tracking-[-0.055em] sm:text-6xl">
                Let’s make room for the{" "}
                <span className="text-primary">first frame.</span>
              </h2>
            </div>
            <Link href="/contact">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-primary bg-primary px-5 font-sans text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Start a project <ArrowUpRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </StudioShell>
  );
}
