"use client"

import { source } from "@/lib/source"
import { ComponentCard } from "@/components/component-card/component-card"

export function RegistryGrid({ slugs }: { slugs: string[] }) {
  return (
    <div className="mt-8 mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {slugs.map((slug) => {
        const page = source.getPage(["components", slug])

        if (!page) {
          console.warn(`RegistryGrid: Component slug not found: ${slug}`)
          return null
        }

        const { title, description, media, registryKeys, badge } = page.data

        const demoCount = registryKeys?.length || 0
        const demoText = demoCount > 0
          ? ` (Includes ${demoCount} pre-built demo variant${demoCount > 1 ? "s" : ""}.)`
          : ""

        const combinedDescription = `${description}${demoText}`

        return (
          <ComponentCard
            key={slug}
            title={title}
            description={combinedDescription}
            url={page.url}
            badge={badge}
            media={media}
          />
        )
      })}
    </div>
  )
}
