// Design system reminder: Shared Satisium UI grammar — photography lives in rounded neutral cards; primary orange signals action and state.

import type { Project } from "@/content/site";
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

const aspectClasses = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

export function ProjectTile({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  return (
    <article className="group break-inside-avoid">
      <Link
        href="/contact"
        className="block outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div
          className={`relative overflow-hidden rounded-[1rem] bg-muted ${aspectClasses[project.aspect]} ${compact ? "" : "mb-3"}`}
        >
          <img
            src={project.image}
            alt={project.alt}
            className="size-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
          />
          <span className="absolute top-3 left-3 rounded-full bg-background/95 px-3 py-1.5 font-mono text-[10px] text-foreground shadow-sm backdrop-blur">
            {project.id} / {project.category}
          </span>
          <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-foreground text-background opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
        {!compact && (
          <div className="flex items-start justify-between gap-4 px-1 pb-1">
            <div>
              <h3 className="font-sans text-xl font-bold tracking-tight">
                {project.title}
              </h3>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground uppercase">
                {project.place} · {project.year}
              </p>
            </div>
            <span className="font-mono text-[10px] text-primary">Enquire</span>
          </div>
        )}
      </Link>
    </article>
  );
}
