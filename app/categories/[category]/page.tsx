import { queryContent } from "@/lib/content-query"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CategoryHero } from "@/components/component-card/category-hero"
import { ComponentCard } from "@/components/component-card/component-card"
import { CATEGORIES } from "@/lib/utils"
import { Metadata } from "next"


export function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category,
  }))
}

export async function generateMetadata(props: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const params = await props.params
  const formattedCategory = params.category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const title = `${formattedCategory} Components`
  const description = `Browse beautifully crafted ${formattedCategory.toLowerCase()} components. Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://satisui.xyz/categories/${params.category}`,
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

export default async function CategoryPage(props: {
  params: Promise<{ category: string }>
}) {
  const params = await props.params
  const category = params.category

  if (!CATEGORIES.includes(category as any)) return notFound()

  const { pages } = queryContent({
    category: category,
  })

  if (!pages.length) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
        <CategoryHero title={category} count={pages.length} />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
      <CategoryHero title={category} count={pages.length} />

      <div className="mx-auto mt-16 flex w-full flex-col gap-10">
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
    </div>
  )
}