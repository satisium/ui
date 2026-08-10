// lib/content-query.ts
import { source } from "@/lib/source"

export type CollectionType = "components" | "blocks" | "templates"
export type PageType = ReturnType<typeof source.getPages>[0]

export interface QueryOptions {
  type?: CollectionType
  category?: string
}

export function queryContent(options: QueryOptions) {
  const { type, category } = options

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

  pages.sort((a, b) => a.data.title.localeCompare(b.data.title))

  return { pages, grouped: null }
}
