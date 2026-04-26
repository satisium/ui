import { CategoryHero } from "@/components/component-card/category-hero"
import { PremiumComponentCard } from "@/components/component-card/component-card"
import { queryContent } from "@/lib/content-query"
import { TAXONOMY } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Metadata } from "next"

export function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = []

  for (const [category, subcategories] of Object.entries(TAXONOMY)) {
    for (const subcategory of subcategories) {
      params.push({ category, subcategory })
    }
  }

  return params
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; subcategory: string }>
}): Promise<Metadata> {
  const params = await props.params
  const formattedSubcategory = params.subcategory
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const title = `${formattedSubcategory} Components`
  const description = `Browse ${formattedSubcategory.toLowerCase()} components. Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://satisui.xyz/categories/${params.category}/${params.subcategory}`,
    },
    openGraph: {
      title: `${title} | SATIS UI`,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SATIS UI`,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
  }
}

export default async function SubCategoryPage(props: {
  params: Promise<{ category: string; subcategory: string }>
}) {
  const params = await props.params
  const { category, subcategory } = params

  const validSubcategories = TAXONOMY[category as keyof typeof TAXONOMY] as
    | readonly string[]
    | undefined

  if (!validSubcategories || !validSubcategories.includes(subcategory)) {
    return notFound()
  }

  const { pages } = queryContent({
    category: category,
    subcategory: subcategory,
    groupBySubcategory: false,
  })

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
