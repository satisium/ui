// Design system reminder: Shared Satisium UI grammar — a compact, ownable utility symbol built from rounded status tracks and one controlled orange intent signal.

import { cn } from "@/lib/utils";

export function LumenMark({
  className,
  label = "Lumen House",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={label}
      className={cn("block", className)}
    >
      <rect x="2" y="2" width="44" height="44" rx="14" fill="currentColor" />
      <rect
        x="13"
        y="12"
        width="13"
        height="5"
        rx="2.5"
        fill="var(--background)"
      />
      <rect
        x="13"
        y="21.5"
        width="22"
        height="5"
        rx="2.5"
        fill="var(--background)"
      />
      <rect
        x="13"
        y="31"
        width="9"
        height="5"
        rx="2.5"
        fill="var(--background)"
      />
      <rect x="28" y="12" width="7" height="7" rx="2.4" fill="var(--primary)" />
      <rect x="27" y="30" width="9" height="7" rx="3.5" fill="var(--primary)" />
    </svg>
  );
}
