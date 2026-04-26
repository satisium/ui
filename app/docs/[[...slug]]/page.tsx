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

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) return {}

  const slugPath = params.slug ? params.slug.join("/") : ""
  const canonicalUrl = `https://satisui.xyz/docs/${slugPath}`
  const description =
    page.data.description ||
    `Copy and paste the ${page.data.title} component. Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.`

  return {
    title: page.data.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${page.data.title} | SATIS UI`,
      description,
      images: [`/api/og?title=${encodeURIComponent(page.data.title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.data.title} | SATIS UI`,
      description,
      images: [`/api/og?title=${encodeURIComponent(page.data.title)}`],
    },
  }
}

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

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) notFound()

  const MDX = page.data.body
  const neighbours = findNeighbour(source.pageTree, page.url)

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
    lastModifiedTime = "Apr 26, 2026"
  }

  const hasCategories = page.data.category && page.data.category.length > 0
  const hasSubcategories =
    page.data.subcategory && page.data.subcategory.length > 0

  const baseUrl = "https://satisui.xyz/docs"
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Docs", item: baseUrl },
  ]

  if (params.slug) {
    let currentPath = baseUrl
    params.slug.forEach((slugPart, index) => {
      currentPath += `/${slugPart}`
      breadcrumbItems.push({
        "@type": "ListItem",
        position: index + 2,
        name: slugPart.replace(/-/g, " "),
        item: currentPath,
      })
    })
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${page.data.title} Component`,
    description: page.data.description,
    programmingLanguage: "TypeScript",
    codeSampleType: "UI Component",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="flex w-full animate-in flex-col duration-700 ease-out-expo fade-in">
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
          <header className="flex flex-col gap-6">
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

            <div className="flex flex-col gap-4">
              <h1 className="capitalize">{page.data.title}</h1>
              <p className="max-w-4xl text-muted-foreground">
                {page.data.description}
              </p>
              {lastModifiedTime && (
                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                  <span className="text-caption">Last Modified:</span>
                  <span className="text-caption">{lastModifiedTime}</span>
                </div>
              )}
            </div>

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

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-32">
            <div className="w-full min-w-0 pb-32">
              <MDX components={defaultMdxComponents} />

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
                      <span className="flex items-center gap-2 font-heading font-bold text-foreground transition-colors group-hover:text-primary">
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
                      <span className="flex items-center gap-2 font-heading font-bold text-foreground transition-colors group-hover:text-primary">
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
    </>
  )
}
