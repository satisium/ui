// Design system reminder: Shared Satisium UI grammar — a detail frame is image-led within a neutral shell, with a stable semantic image and restrained metadata regardless of optional motion.

import { projects } from "@/content/site";
import { lazy, Suspense, useEffect, useState } from "react";

const GlassSlices = lazy(() => import("@/components/satisium-ui/glass-slices"));
const featuredProject = projects[0];

function canEnhance() {
  return window.matchMedia(
    "(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
  ).matches;
}

export function GlassShowcaseFrame() {
  const [enhance, setEnhance] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: no-preference)"
    );
    const widthQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnhance(canEnhance());
    update();
    motionQuery.addEventListener("change", update);
    widthQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      widthQuery.removeEventListener("change", update);
    };
  }, []);

  return (
    <figure className="relative min-h-0 overflow-hidden rounded-[1.1rem] border border-border bg-muted p-1.5">
      <img
        src={featuredProject.image}
        alt={featuredProject.alt}
        className="aspect-[4/3] h-full w-full rounded-[0.7rem] object-cover lg:aspect-auto"
      />
      {enhance ? (
        <div aria-hidden="true" className="absolute inset-0">
          <Suspense fallback={null}>
            <GlassSlices
              mediaUrl={featuredProject.image}
              slices={18}
              hoverRadius={0.19}
              minSliceWidth={0.7}
              shiftY={0.06}
              imageZoom={1.08}
              mouseLerpSpeed={4}
              enterLeaveSpeed={2.5}
              className="bg-transparent"
            />
          </Suspense>
        </div>
      ) : null}
      <figcaption className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4 rounded-xl bg-background/90 p-3 backdrop-blur-sm">
        <span className="font-mono text-[10px] leading-4 text-muted-foreground">
          01 / PORTRAIT
          <br />
          <span className="text-foreground">MARA, IN STILL LIGHT</span>
        </span>
        <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] text-primary-foreground">
          2025
        </span>
      </figcaption>
    </figure>
  );
}
