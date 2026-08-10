import { CategoryHero } from "@/components/component-card/category-hero"
import { TAXONOMY, CATEGORIES } from "@/lib/utils"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse our collection of animated UI components. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
  alternates: {
    canonical: "https://ui.satisium.com/categories",
  },
  openGraph: {
    title: "Categories | Satisium UI",
    description:
      "Browse our collection of animated UI components. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    images: ["/api/og?title=Categories"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories | Satisium UI",
    images: ["/api/og?title=Categories"],
  },
}

export default function AllCategoriesPage() {
  const categoryCount = CATEGORIES.length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
      <CategoryHero
        title="Categories"
        count={categoryCount}
        description="Browse our collection of animated UI components organized by type."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(TAXONOMY).map(([category]) => (
          <Link
            key={category}
            href={`/categories/${category}`}
            className="group flex flex-col rounded-3xl bg-muted p-2 transition-all duration-500"
          >
            <div className="flex flex-col justify-between rounded-2xl bg-background p-6 transition-transform duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-foreground capitalize transition-colors group-hover:text-primary">
                  {category.replace("-", " ")}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}