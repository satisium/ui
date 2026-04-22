// app/categories/[category]/page.tsx
import { queryContent } from "@/lib/content-query"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CategoryHero } from "@/components/component-card/category-hero"
import { PremiumComponentCard } from "@/components/component-card/component-card"
import { CATEGORIES } from "@/lib/utils"

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }))
}

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>
}) {
  const params = await props.params
  const category = params.category

  if (!CATEGORIES.includes(category as any)) return notFound()

  const { pages, grouped } = queryContent({
    category: category,
    groupBySubcategory: true,
  })

  if (!pages.length || !grouped) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
        <CategoryHero title={category} count={pages.length} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
      <CategoryHero title={category} count={pages.length} />
      <div className="mx-auto mt-16 flex w-full flex-col gap-24 md:gap-32">
        {Object.entries(grouped).map(([subcat, items]) => (
          <section key={subcat} className="flex flex-col gap-10">
            <header className="flex flex-col gap-3">
              <div className="flex items-end justify-between">
                <div className="flex gap-2">
                  <Link
                    href={`/categories/${category}/${subcat}`}
                    className="font-heading text-2xl font-bold tracking-tight text-foreground capitalize transition-colors duration-300 hover:text-primary"
                  >
                    {subcat.replace("-", " ")}
                  </Link>
                  <p className="font-mono text-[0.7rem] font-bold tracking-widest text-muted-foreground uppercase">
                    {items.length}{" "}
                  </p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <PremiumComponentCard
                  key={item.url}
                  url={item.url}
                  title={item.data.title}
                  description={item.data.description}
                  badge={item.data.badge}
                  media={item.data.media}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
