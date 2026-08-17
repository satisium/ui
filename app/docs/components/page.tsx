import { queryContent } from "@/lib/content-query"
import { CATEGORIES } from "@/lib/utils"
import { CategoryHero } from "@/components/component-card/category-hero"
import { ComponentCard } from "@/components/component-card/component-card"
import { Metadata } from "next"
import { SITE_URL } from "@/lib/config"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Components | Satisium UI",
    description:
      "Browse all beautifully crafted animated components for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    alternates: {
      canonical: `${SITE_URL}/docs/components`,
    },
    openGraph: {
      title: "Components | Satisium UI",
      description:
        "Browse all beautifully crafted animated components for design engineers.",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent("Components")}`,
          width: 1200,
          height: 630,
          alt: "Components | Satisium UI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Components | Satisium UI",
      description:
        "Browse all beautifully crafted animated components for design engineers.",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent("Components")}`,
          width: 1200,
          height: 630,
          alt: "Components | Satisium UI",
        },
      ],
    },
  }
}

export default async function ComponentsIndexPage() {
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-8 py-24 lg:py-32">
      {categories.map(({ category, pages: categoryPages }) => (
        <section key={category} className="flex flex-col gap-6">
          <CategoryHero title={category} count={categoryPages.length} />

          <div className="mx-auto mt-4 flex w-full flex-col gap-10">
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
