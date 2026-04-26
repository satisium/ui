import { MetadataRoute } from "next"
import { source } from "@/lib/source"
import { CATEGORIES, TAXONOMY } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://satisui.xyz"

  const pages = source.getPages()

  const docUrls = pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryUrls = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categories/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const subCategoryUrls = Object.entries(TAXONOMY).flatMap(
    ([category, subcategories]) =>
      subcategories.map((subcategory) => ({
        url: `${baseUrl}/categories/${category}/${subcategory}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
  )

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...categoryUrls,
    ...subCategoryUrls,
    ...docUrls,
  ]
}
