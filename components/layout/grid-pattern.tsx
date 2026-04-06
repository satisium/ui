// components/layout/grid-pattern.tsx
export function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 ml-3 [mask-image:linear-gradient(to_bottom,white,transparent_80%)]">
      <svg
        className="absolute inset-0 h-full w-full stroke-border/40 dark:stroke-border/10"
        fill="none"
      >
        <defs>
          <pattern
            id="spatial-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 40V.5H40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#spatial-grid)" />
      </svg>
    </div>
  )
}
