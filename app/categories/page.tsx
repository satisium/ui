// app/categories/page.tsx
import { CategoryHero } from "@/components/component-card/category-hero"
import { TAXONOMY } from "@/lib/utils"
import Link from "next/link"

export default function AllCategoriesPage() {
  const totalSubcategories = Object.values(TAXONOMY).flat().length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 lg:py-32">
      <CategoryHero
        title="Categories"
        count={totalSubcategories}
        description="An organized taxonomy of interface elements, structural layouts, and interactive patterns."
      />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(TAXONOMY).map(([category, subcategories]) => (
          <Link
            key={category}
            href={`/categories/${category}`}
            // 1. OUTER TRAY: No borders, subtle background, larger radius
            className="group flex flex-col rounded-3xl bg-muted p-2 transition-all duration-500"
          >
            {/* 2. INNER CARD: Elevated surface, pure background, tracks hover scale */}
            <div className="flex flex-col justify-between rounded-2xl bg-background p-6 transition-transform duration-500">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold tracking-tight text-foreground capitalize transition-colors group-hover:text-primary">
                  {category.replace("-", " ")}
                </h2>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 font-mono text-[0.65rem] font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  {subcategories.length}
                </span>
              </div>
            </div>

            {/* 3. META FOOTER: Converted from bullet list to seamless typography flow */}
            <div className="px-6 py-4">
              <p className="line-clamp-2 font-body text-sm leading-relaxed text-muted-foreground/70 transition-colors group-hover:text-muted-foreground">
                {subcategories
                  .map((sub) =>
                    sub
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")
                  )
                  .join(", ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
