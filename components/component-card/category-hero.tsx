// components/component-card/category-hero.tsx
"use client"

export function CategoryHero({
  title,
  count,
  description,
}: {
  title: string
  count?: number
  description?: string
}) {
  return (
    <header className="flex w-full flex-col items-start gap-4">
      <h1 className="capitalize">{title}</h1>

      <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
        {description ||
          (count === 0
            ? "We're currently crafting components for this category. Check back soon."
            : `Explore ${count} meticulously crafted components and micro-interactions for your next project.`)}
      </p>
    </header>
  )
}
