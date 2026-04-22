// src/app/docs/[[...slug]]/page.tsx
import { source } from "@/lib/source"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { findNeighbour } from "fumadocs-core/page-tree"
import { getGithubLastEdit } from "fumadocs-core/content/github"
import { defaultMdxComponents } from "@/components/mdx-components"
import { TableOfContents } from "@/components/layout/toc"

import {
  ComponentPreviewer,
  type DemoData,
} from "@/components/previewer/component-preview"
import { registry } from "@/registry/index"
import { cn } from "@/lib/utils"

// 1. Static Params & Metadata
export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) return {}
  return {
    title: `${page.data.title} | SATIS UI`,
    description: page.data.description,
  }
}

// --------------------------------------------------------
// HELPER: SEMANTIC BADGE STYLES
// --------------------------------------------------------
function getBadgeStyle(badge: string) {
  switch (badge.toLowerCase()) {
    case "new":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
    case "updated":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500"
    case "beta":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500"
    case "deprecated":
      return "border-rose-500/20 bg-rose-500/10 text-rose-500"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

// --------------------------------------------------------
// MAIN PAGE COMPONENT
// --------------------------------------------------------
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) notFound()

  const MDX = page.data.body
  const neighbours = findNeighbour(source.pageTree, page.url)

  // ------------------------------------------------------
  // 1. ASYNC REGISTRY RESOLUTION
  // ------------------------------------------------------
  const resolvedDemos: DemoData[] = []
  const pageRegistry = registry ?? {}

  if (page.data.registryKeys && page.data.registryKeys.length > 0) {
    for (const key of page.data.registryKeys) {
      const item = pageRegistry[key]
      if (item) {
        const files = await item.getFiles()
        const Comp = item.component

        resolvedDemos.push({
          key,
          name: item.name,
          component: <Comp />,
          files,
          installCommand: item.installCommand,
        })
      }
    }
  }

  // ------------------------------------------------------
  // 2. FETCH GITHUB LAST MODIFIED
  // ------------------------------------------------------
  let lastModifiedTime: string | null = null

  if (process.env.NODE_ENV !== "development") {
    try {
      const time = await getGithubLastEdit({
        owner: "your-github-username",
        repo: "your-repo-name",
        path: `content/docs/${page.path}`,
        token: process.env.GIT_TOKEN
          ? `Bearer ${process.env.GIT_TOKEN}`
          : undefined,
      })
      if (time) {
        lastModifiedTime = new Date(time).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      }
    } catch (error) {
      console.error("Failed to fetch last edit time:", error)
    }
  } else {
    lastModifiedTime = "Apr 7, 2026"
  }

  // Helper flags for taxonomy
  const hasCategories = page.data.category && page.data.category.length > 0
  const hasSubcategories =
    page.data.subcategory && page.data.subcategory.length > 0

  return (
    <div className="flex w-full animate-in flex-col duration-700 ease-out-expo fade-in">
      {/* 100dvh HERO PREVIEWER */}
      {resolvedDemos.length > 0 && (
        <section className="h-screen w-full">
          <ComponentPreviewer
            title={page.data.title}
            demos={resolvedDemos}
            githubUrl={page.data.links?.github}
            previewUrl={page.data.links?.preview}
          />
        </section>
      )}

      <article className="mx-auto flex w-full flex-col gap-12 px-8 py-24 md:px-16 md:pl-24 lg:py-32 xl:px-64">
        {/* REFINED HEADER: Clean, Hierarchical, Intent-Driven */}
        <header className="flex flex-col gap-6">
          {/* 1. SEO Taxonomy / Breadcrumbs */}
          {(hasCategories || hasSubcategories) && (
            <nav className="flex flex-wrap items-center gap-2">
              {page.data.category?.map((cat) => (
                <Link href={`/categories/${cat}`} key={cat}>
                  <span className="inline-flex cursor-pointer items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground capitalize transition-colors hover:bg-muted hover:text-foreground">
                    {cat.replace("-", " ")}
                  </span>
                </Link>
              ))}

              {hasCategories && hasSubcategories && (
                <span className="mx-1 text-muted-foreground/40">|</span>
              )}

              {page.data.subcategory?.map((sub) => (
                <Link
                  href={
                    hasCategories
                      ? `/categories/${page.data.category?.[0]}/${sub}`
                      : `/categories/${sub}`
                  }
                  key={sub}
                >
                  <span className="inline-flex cursor-pointer items-center rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium tracking-wide text-primary capitalize transition-all hover:bg-primary hover:text-primary-foreground">
                    {sub.replace("-", " ")}
                  </span>
                </Link>
              ))}
            </nav>
          )}

          {/* 2. Title & Description */}
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-display-sm">
              {page.data.title}
            </h1>
            <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
              {page.data.description}
            </p>
            {lastModifiedTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-[0.65rem] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                  Last Modified:
                </span>
                <span className="font-mono text-[0.75rem] font-medium text-foreground">
                  {lastModifiedTime}
                </span>
              </div>
            )}
          </div>

          {/* 3. Metadata Row (Badges, Last Modified, Type) */}
          <div className="mt-2 flex flex-col-reverse items-start justify-start gap-4">
            <div className="flex flex-row flex-wrap gap-4 text-center">
              {page.data.badge && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold tracking-widest uppercase",
                    getBadgeStyle(page.data.badge)
                  )}
                >
                  {page.data.badge}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* MDX CONTENT & LAYOUT */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-32">
          <div className="w-full min-w-0 pb-32">
            <MDX components={defaultMdxComponents} />

            {/* Pagination */}
            <div className="mt-24 flex flex-col gap-8 border-t border-border/50 pt-10">
              <nav
                aria-label="Pagination"
                className="flex flex-col items-center justify-between gap-8 sm:flex-row"
              >
                {neighbours.previous ? (
                  <Link
                    href={neighbours.previous.url}
                    className="group flex w-full flex-col gap-2 sm:w-auto"
                  >
                    <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-foreground">
                      Previous
                    </span>
                    <span className="flex items-center gap-2 font-heading text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                      {neighbours.previous.name}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden flex-1 sm:block" />
                )}

                {neighbours.next ? (
                  <Link
                    href={neighbours.next.url}
                    className="group flex w-full flex-col gap-2 text-left sm:w-auto sm:items-end sm:text-right"
                  >
                    <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-foreground">
                      Next
                    </span>
                    <span className="flex items-center gap-2 font-heading text-lg font-medium text-foreground transition-colors group-hover:text-primary">
                      {neighbours.next.name}
                    </span>
                  </Link>
                ) : (
                  <div className="hidden flex-1 sm:block" />
                )}
              </nav>
            </div>
          </div>

          <aside className="sticky top-24 no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
            <TableOfContents items={page.data.toc} />
          </aside>
        </div>
      </article>
    </div>
  )
}
