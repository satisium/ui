// Design system reminder: Shared Satisium UI grammar — neutral surfaces, primary orange intent and Plus Jakarta Sans hierarchy.

import { BlurReveal } from "@/components/satisium-ui/blur-reveal";

export function SectionHeading({
  index,
  title,
  copy,
}: {
  index: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="grid gap-5 border-t border-border pt-5 md:grid-cols-[110px_1fr_0.7fr] md:gap-8">
      <p className="flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.1em] text-primary uppercase">
        <span className="size-1.5 rounded-full bg-primary" />
        {index}
      </p>
      <BlurReveal
        as="h2"
        text={title}
        splitBy="word"
        blur={false}
        duration={0.55}
        stagger={0.05}
        triggerStart="top 91%"
        className="font-sans text-4xl font-bold leading-[0.96] tracking-[-0.05em] sm:text-5xl"
      />
      {copy ? (
        <p className="max-w-md font-sans text-sm leading-6 text-muted-foreground">
          {copy}
        </p>
      ) : null}
    </div>
  );
}
