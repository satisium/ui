// Design system reminder: Shared Satisium UI grammar — geometry is an abstract status system of soft tracks and markers, never photography hardware or framing.

export function ApertureOrbit({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 640"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g className="origin-center animate-[spin_28s_linear_infinite] motion-reduce:animate-none">
        <rect
          x="106"
          y="126"
          width="372"
          height="62"
          rx="31"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="3 16"
        />
        <rect
          x="174"
          y="250"
          width="286"
          height="122"
          rx="61"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
        <rect
          x="254"
          y="426"
          width="132"
          height="44"
          rx="22"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.12"
          strokeWidth="2"
        />
      </g>
      <g className="origin-center animate-[spin_18s_linear_infinite_reverse] motion-reduce:animate-none">
        <rect
          x="306"
          y="118"
          width="16"
          height="16"
          rx="7"
          fill="var(--primary)"
        />
        <rect
          x="151"
          y="402"
          width="12"
          height="12"
          rx="5"
          fill="var(--primary)"
          fillOpacity="0.75"
        />
        <rect
          x="477"
          y="402"
          width="12"
          height="12"
          rx="5"
          fill="var(--primary)"
          fillOpacity="0.75"
        />
      </g>
      <rect
        x="282"
        y="286"
        width="76"
        height="48"
        rx="24"
        fill="var(--primary)"
        fillOpacity="0.08"
      />
    </svg>
  );
}
