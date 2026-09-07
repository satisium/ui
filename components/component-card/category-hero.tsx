// components/component-card/category-hero.tsx
"use client"

export function CategoryHero({
  title,
  count,
  description,
  showTitle = true,
  showDescription = true,
  showCount = false,
}: {
  title: string
  count?: number
  description?: string
  showTitle?: boolean
  showDescription?: boolean
  showCount?: boolean
}) {
  return (
    <header className="flex w-full flex-col items-start gap-4">
      {(showTitle || showCount) && (
        <div className="flex flex-row flex-wrap items-center gap-4">
          {showTitle && <h1 className="capitalize">{title}</h1>}
          {showCount && count !== undefined && (
            <span className="-mt-6 text-[12px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
        </div>
      )}

      {showDescription && (
        <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
          {description ||
            (count === 0
              ? "We're currently crafting components for this category. Check back soon."
              : `Explore ${count} meticulously crafted components and micro-interactions for your next project.`)}
        </p>
      )}
    </header>
  )
}
