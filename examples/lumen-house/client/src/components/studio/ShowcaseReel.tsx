// Design system reminder: Shared Satisium UI grammar — photography takes priority in a spacious, neutral rounded shell; motion is patient and never relies on a dark gallery mode.

import { AscentCarousel } from "@/components/satisium-ui/ascent-carousel";
import type { Project } from "@/content/site";

const reelItems = (projects: Project[]) =>
  projects.map(project => ({
    id: project.id,
    url: project.image,
    alt: project.alt,
  }));

export function ShowcaseReel({ projects }: { projects: Project[] }) {
  return (
    <section
      aria-labelledby="reel-title"
      className="rounded-[1.4rem] bg-background px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
    >
      <div className="mx-auto mb-6 flex max-w-[1440px] items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[10px] text-primary">
            A MOVING SELECTION
          </p>
          <h2
            id="reel-title"
            className="mt-2 font-sans text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Stay with the image a little longer.
          </h2>
        </div>
        <p className="hidden max-w-48 font-mono text-[10px] leading-4 text-muted-foreground sm:block">
          SIX COMMISSIONS / ONE UNHURRIED SEQUENCE
        </p>
      </div>
      <div
        onWheelCapture={event => event.preventDefault()}
        className="mx-auto h-[min(68svh,760px)] min-h-[420px] max-w-[1440px] overflow-hidden rounded-[1rem] border border-border bg-muted p-1.5 sm:min-h-[560px]"
      >
        <AscentCarousel
          items={reelItems(projects)}
          visibleItems={2}
          maxHeight={760}
          minHeight={210}
          breakpoints={{
            640: { visibleItems: 3, maxHeight: 760, minHeight: 260 },
            1024: { visibleItems: 4, maxHeight: 760, minHeight: 320 },
          }}
          scrollMultiplier={0.003}
          friction={0.96}
          className="h-full rounded-[0.7rem] bg-background"
        />
      </div>
      <p className="mx-auto mt-4 flex max-w-[1440px] items-center gap-2 font-sans text-sm leading-6 text-muted-foreground">
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-primary"
        />
        Six commissions, held in a single uninterrupted sequence.
      </p>
    </section>
  );
}
