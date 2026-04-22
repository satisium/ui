// app/categories/[category]/[subcategory]/page.tsx
import { CategoryHero } from "@/components/component-card/category-hero"
import { PremiumComponentCard } from "@/components/component-card/component-card"
import { queryContent } from "@/lib/content-query"
import { TAXONOMY } from "@/lib/utils"

import { notFound } from "next/navigation"

// Generate paths for EVERY valid category + subcategory combination
export function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = []

  for (const [category, subcategories] of Object.entries(TAXONOMY)) {
    for (const subcategory of subcategories) {
      params.push({ category, subcategory })
    }
  }

  return params
}

export default async function SubCategoryPage(props: {
  params: Promise<{ category: string; subcategory: string }>
}) {
  const params = await props.params
  const { category, subcategory } = params

  // 1. Validation check: Does this subcategory legally belong to this category?
  const validSubcategories = TAXONOMY[category as keyof typeof TAXONOMY]
  if (!validSubcategories || !validSubcategories.includes(subcategory)) {
    return notFound()
  }

  // 2. Query exactly what we need
  const { pages } = queryContent({
    category: category,
    subcategory: subcategory,
    groupBySubcategory: false, // We don't need to group, this entire page IS the group
  })

  // 3. Dynamic Title (e.g., "Marketing / Pricing")
  const pageTitle = `${category}  >  ${subcategory}`
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
      <CategoryHero title={pageTitle} count={pages.length} />

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((item) => (
          <PremiumComponentCard
            key={item.url}
            url={item.url}
            title={item.data.title}
            description={item.data.description}
            badge={item.data.badge}
            media={item.data.media}
          />
        ))}
        {pages.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No components found for this category yet.
          </p>
        )}
      </div>
    </div>
  )
}
