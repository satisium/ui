// lib/content-query.ts
import { source } from "@/lib/source"

export type CollectionType = "components" | "blocks" | "templates"
export type PageType = ReturnType<typeof source.getPages>[0]

export interface QueryOptions {
  type?: CollectionType
  category?: string
  subcategory?: string
  groupBySubcategory?: boolean
}

export function queryContent(options: QueryOptions) {
  const { type, category, subcategory, groupBySubcategory = false } = options

  let pages = source.getPages().filter((page) => page.data.component === true)

  if (type) {
    pages = pages.filter((page) => page.url.startsWith(`/docs/${type}`))
  }

  if (category) {
    pages = pages.filter((page) =>
      page.data.category
        ?.map((c) => c.toLowerCase())
        .includes(category.toLowerCase())
    )
  }

  if (subcategory) {
    pages = pages.filter((page) =>
      page.data.subcategory
        ?.map((s) => s.toLowerCase())
        .includes(subcategory.toLowerCase())
    )
  }

  pages.sort((a, b) => a.data.title.localeCompare(b.data.title))

  if (groupBySubcategory) {
    const grouped = pages.reduce(
      (acc, page) => {
        const sub = page.data.subcategory?.[0] || "general"

        if (!acc[sub]) {
          acc[sub] = []
        }
        acc[sub].push(page)

        return acc
      },
      {} as Record<string, PageType[]>
    )

    const sortedGroups = Object.keys(grouped)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = grouped[key]
          return acc
        },
        {} as Record<string, PageType[]>
      )

    return { pages, grouped: sortedGroups }
  }

  return { pages, grouped: null }
}
