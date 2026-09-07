import { queryContent } from "@/lib/content-query"
import { CategoryHero } from "@/components/component-card/category-hero"
import { ComponentCard } from "@/components/component-card/component-card"

export function CategoryGrid({
  category,
  showCount = false,
}: {
  category: string
  showCount?: boolean
}) {
  const { pages } = queryContent({ category })

  return (
    <div className="flex w-full flex-col gap-10">
      <CategoryHero
        title={category}
        count={pages.length}
        showTitle={false}
        showDescription={false}
        showCount={showCount}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((item) => (
          <ComponentCard
            key={item.url}
            url={item.url}
            title={item.data.title}
            description={item.data.description}
            badge={item.data.badge}
            media={item.data.media}
          />
        ))}
      </div>
    </div>
  )
}
