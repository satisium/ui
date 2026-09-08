"use client"

import Link from "next/link"
import { getBreadcrumbItems } from "fumadocs-core/breadcrumb"
import type * as PageTree from "fumadocs-core/page-tree"

interface PageBreadcrumbsProps {
  pageUrl: string
  tree: PageTree.Root
}

export function PageBreadcrumbs({ pageUrl, tree }: PageBreadcrumbsProps) {
  const items = getBreadcrumbItems(pageUrl, tree, {
    includePage: true,
    includeRoot: false,
  })

  if (items.length <= 1) return null

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        if (isLast || !item.url) {
          return (
            <span
              key={index}
              className="text-xs font-medium tracking-wide text-foreground/80 capitalize"
            >
              {index > 0 && (
                <span className="mr-2 text-muted-foreground/50">›</span>
              )}
              {item.name}
            </span>
          )
        }

        return (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-muted-foreground/50">›</span>
            )}
            <Link href={item.url}>
              <span className="inline-flex cursor-pointer items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground capitalize transition-colors hover:bg-muted hover:text-foreground">
                {item.name}
              </span>
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
