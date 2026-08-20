import { DocTracker } from "@/components/doc-tracker"
import { TableOfContents } from "@/components/layout/toc"
import { defaultMdxComponents } from "@/components/mdx-components"
import { ComponentPreviewer } from "@/components/previewer/component-preview"
import { CopyMdxButton } from "@/components/ui/copy-mdx-button"
import { SITE_URL } from "@/lib/config"
import {
  getDocBreadcrumbSchema,
  getDocCopyPayload,
  getDocEntitySchema,
  getLastModifiedTime,
  resolveDocDemos,
} from "@/lib/docs-page"
import { source } from "@/lib/source"
import { cn } from "@/lib/utils"
import { findNeighbour } from "fumadocs-core/page-tree"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

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
  const canonicalUrl = `${SITE_URL}/docs/${slugPath}`
  const description =
    page.data.description ||
    `Explore the ${page.data.title} component. Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP.`

  const lastModifiedRaw = await getLastModifiedTime(page.path)

  const tags: string[] = []
  if (page.data.badge) tags.push(page.data.badge)
  if (page.data.category && Array.isArray(page.data.category)) {
    tags.push(...page.data.category)
  }

  // Determine the dynamic label based on the component's category (e.g., TEXT EFFECTS)
  // Fallback to "DOCUMENTATION" if no category exists.
  const dynamicLabel = page.data.category?.[0]
    ? page.data.category[0].replace(/-/g, " ").toUpperCase()
    : "DOCUMENTATION"

  const ogUrl = `/api/og?title=${encodeURIComponent(page.data.title)}&label=${encodeURIComponent(dynamicLabel)}`

  return {
    title: page.data.title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      ...(lastModifiedRaw && {
        "article:published_time": lastModifiedRaw,
        "article:modified_time": lastModifiedRaw,
      }),
      ...(page.data.category?.[0] && {
        "article:section": page.data.category[0],
      }),
      ...(tags.length > 0 && {
        "article:tag": tags.join(", "),
      }),
    },
    openGraph: {
      title: `${page.data.title} | Satisium UI`,
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.data.title} | Satisium UI`,
      description,
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: page.data.title,
        },
      ],
    },
  }
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>
}) {
  const params = await props.params
  const page = source.getPage(params.slug)

  if (!page) notFound()

  const [copyPayload, resolvedDemos, lastModifiedTime] = await Promise.all([
    getDocCopyPayload(page.path),
    resolveDocDemos(page),
    getLastModifiedTime(page.path),
  ])

  const MDX = page.data.body
  const neighbours = findNeighbour(source.pageTree, page.url)
  const hasCategories = page.data.category && page.data.category.length > 0
  const isWide = page.data.wide
  const breadcrumbSchema = getDocBreadcrumbSchema(params.slug)
  const entitySchema = getDocEntitySchema(
    page.data.title,
    page.data.description
  )

  return (
    <>
      <DocTracker
        title={page.data.title}
        category={page.data.category?.[0]}
        badge={page.data.badge}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(entitySchema) }}
      />

      <div className="flex w-full animate-in flex-col duration-700 ease-out-expo fade-in">
        {resolvedDemos.length > 0 && (
          <section className="h-screen w-full">
            <ComponentPreviewer
              title={page.data.title}
              demos={resolvedDemos}
              githubUrl={page.data.links?.github}
              previewUrl={page.data.links?.preview}
              sourceCodeId="installation"
            />
          </section>
        )}

        <article className="mx-auto flex w-full flex-col gap-12 px-8 py-24 md:px-16 md:pl-24 lg:py-32 xl:px-64">
          <header className="flex flex-col gap-6">
            {hasCategories && (
              <nav className="flex flex-wrap items-center gap-2">
                {page.data.category?.map((cat) => (
                  <Link href={`/categories/${cat}`} key={cat}>
                    <span className="inline-flex cursor-pointer items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground capitalize transition-colors hover:bg-muted hover:text-foreground">
                      {cat.replace("-", " ")}
                    </span>
                  </Link>
                ))}
              </nav>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center-safe sm:justify-start">
                <h1 className="capitalize">{page.data.title}</h1>
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

            {!page.data.hideCopy && (
              <div className="mt-2 flex flex-col-reverse items-start justify-start gap-4">
                <CopyMdxButton rawMdx={copyPayload} />
              </div>
            )}
          </header>

          <div
            id="installation"
            className={cn(
              "grid items-start gap-12",
              page.data.hideToc
                ? isWide
                  ? "w-full max-w-7xl grid-cols-1"
                  : "w-full max-w-4xl grid-cols-1"
                : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-32"
            )}
          >
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

            {!page.data.hideToc && (
              <aside className="sticky top-24 no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
                <TableOfContents items={page.data.toc} />
              </aside>
            )}
          </div>
        </article>
      </div>
    </>
  )
}
