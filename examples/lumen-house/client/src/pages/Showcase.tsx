// Design system reminder: Shared Satisium UI grammar — a client-facing, paced gallery uses oversized media, soft rounded shells, orange intent and contained scroll-led motion.

import { ManifestoTextReveal } from "@/components/satisium-ui/manifesto-text-reveal";
import { GlassShowcaseFrame } from "@/components/studio/GlassShowcaseFrame";
import { ProjectTile } from "@/components/studio/ProjectTile";
import { ShowcaseReel } from "@/components/studio/ShowcaseReel";
import { StudioShell } from "@/components/studio/StudioShell";
import { Button } from "@/components/ui/button";
import { projects } from "@/content/site";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

const filters = ["All", "Portrait", "Campaign", "Event"] as const;
type Filter = (typeof filters)[number];

export default function Showcase() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const visibleProjects = useMemo(
    () =>
      activeFilter === "All"
        ? projects
        : projects.filter(project => project.category === activeFilter),
    [activeFilter]
  );

  return (
    <StudioShell>
      <main className="space-y-3 px-3 py-3 sm:space-y-5 sm:px-5 sm:py-5">
        <section className="overflow-hidden rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] text-primary">
                LUMEN HOUSE / SELECTED COMMISSIONS
              </p>
              <h1 className="mt-5 max-w-xl font-sans text-[clamp(3.5rem,7vw,7rem)] font-extrabold leading-[0.84] tracking-[-0.07em]">
                The work,
                <br />
                <span className="text-primary">held close.</span>
              </h1>
            </div>
            <p className="max-w-lg font-sans text-base leading-7 text-muted-foreground lg:pb-2">
              Portraits, campaigns and intimate events made with a calm eye, a
              small crew and enough time to let a real moment enter the frame.
            </p>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[1.2rem] bg-muted p-6 sm:p-8">
              <p className="font-mono text-[10px] text-primary">
                THE OPENING FRAME
              </p>
              <p className="mt-10 font-sans text-3xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-4xl">
                A portrait can be quiet and still carry everything.
              </p>
              <Link href="#collection">
                <Button
                  variant="outline"
                  className="mt-10 h-11 rounded-xl border-border bg-background px-4 font-sans text-xs font-semibold hover:border-primary hover:text-primary"
                >
                  Browse the selection{" "}
                  <ArrowDownRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
            <GlassShowcaseFrame />
          </div>
        </section>
        <ShowcaseReel projects={projects} />
        <section className="rounded-[1.4rem] bg-background px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1120px]">
            <p className="font-mono text-[10px] text-primary">
              A WAY OF LOOKING
            </p>
            <ManifestoTextReveal
              as="h2"
              text="Every image begins by making enough room for the person, the place and the unplanned thing that makes the work theirs."
              splitLevel="word"
              scrub={0.7}
              inactiveOpacity={0.22}
              triggerStart="top 78%"
              triggerEnd="bottom 55%"
              className="mt-7 font-sans text-[clamp(2.2rem,5vw,5.4rem)] font-extrabold leading-[0.94] tracking-[-0.065em] text-foreground"
            />
          </div>
        </section>
        <section
          id="collection"
          className="scroll-mt-28 rounded-[1.4rem] bg-muted px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        >
          <div className="mx-auto max-w-[1440px]">
            <div className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] text-primary">
                  THE FULL SELECTION
                </p>
                <h2 className="mt-4 font-sans text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">
                  Find the right story.
                </h2>
              </div>
              <div
                className="flex flex-wrap gap-2"
                aria-label="Filter showcase"
              >
                {filters.map(filter => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={activeFilter === filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-11 rounded-full px-4 font-sans text-xs font-semibold outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary ${activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-foreground hover:text-background"}`}
                  >
                    {filter}
                    <span className="ml-1 text-[10px]">
                      {filter === "All"
                        ? projects.length
                        : projects.filter(
                            project => project.category === filter
                          ).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`rounded-[1.4rem] bg-background p-3 shadow-sm ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-between px-1 font-mono text-[10px] text-muted-foreground uppercase">
                    <span>
                      {String(index + 1).padStart(2, "0")} / {project.category}
                    </span>
                    <span>{project.place}</span>
                  </div>
                  <ProjectTile project={project} />
                </div>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link href="/contact">
                <Button className="h-12 rounded-xl bg-primary px-5 font-sans text-xs font-semibold hover:bg-primary/90">
                  Start a conversation <ArrowUpRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </StudioShell>
  );
}
