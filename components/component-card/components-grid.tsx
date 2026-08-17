import { queryContent } from "@/lib/content-query"
import { CATEGORIES } from "@/lib/utils"
import { CategoryHero } from "@/components/component-card/category-hero"
import { ComponentCard } from "@/components/component-card/component-card"

export function ComponentsGrid() {
  const { pages } = queryContent({})

  const categories = CATEGORIES.map((category) => {
    const categoryPages = pages.filter((page) =>
      page.data.category
        ?.map((c) => c.toLowerCase())
        .includes(category.toLowerCase())
    )
    return { category, pages: categoryPages }
  }).filter((group) => group.pages.length > 0)

  return (
    <div className="flex w-full flex-col gap-16">
      {categories.map(({ category, pages: categoryPages }) => (
        <section key={category} className="flex flex-col gap-6">
          <CategoryHero title={category} count={categoryPages.length} />

          <div className="flex w-full flex-col gap-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {categoryPages.map((item) => (
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
        </section>
      ))}
    </div>
  )
}
