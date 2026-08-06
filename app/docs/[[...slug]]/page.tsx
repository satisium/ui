import fs from "fs"
import path from "path"
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
import { DocTracker } from "@/components/doc-tracker"
import { CopyMdxButton } from "@/components/ui/copy-mdx-button"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
    `Explore the ${page.data.title} component. Animated component library for design engineers. Built with Tailwind v4, Framer Motion and GSAP.`

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
    case "premium":
    case "paid":
      return "border-violet-500/20 bg-violet-500/10 text-violet-500"
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

  let copyPayload = ""
  try {
    // 1. Calculate expected AI file path (public/llms/[folder]/[file].md)
    // We replace the .mdx extension with .md for the LLM files
    const relativePath = page.path.replace(/\.mdx?$/, ".md")
    const aiFilePath = path.join(process.cwd(), "public/llms", relativePath)

    // 2. Calculate the raw MDX fallback path (content/docs/[folder]/[file].mdx)
    const rawMdxPath = path.join(process.cwd(), "content/docs", page.path)

    // 3. Smart Priority: Try to serve the pure, code-injected AI Markdown first!
    if (fs.existsSync(aiFilePath)) {
      copyPayload = fs.readFileSync(aiFilePath, "utf-8")
    }
    // 4. Fallback: If no AI file exists, serve the raw Fumadocs MDX
    else if (fs.existsSync(rawMdxPath)) {
      copyPayload = fs.readFileSync(rawMdxPath, "utf-8")
    }
  } catch (error) {
    console.error("Failed to read copy payload for:", page.path, error)
  }

  const MDX = page.data.body
  const neighbours = findNeighbour(source.pageTree, page.url)
  const pageRegistry = registry ?? {}

  const isPaid = !!(page.data as any).gumroad
  const price = (page.data as any).price || "0.00"
  const gumroadLink = (page.data as any).gumroad || ""

  const resolvedDemos: DemoData[] = []

  if (page.data.registryKeys && page.data.registryKeys.length > 0) {
    for (const key of page.data.registryKeys) {
      const item = pageRegistry[key]
      if (item) {
        const itemType = item.type || "react"
        const renderMode = item.renderMode || "direct" // Defaults to direct

        if (itemType === "video" || itemType === "image") {
          resolvedDemos.push({
            key,
            type: itemType,
            name: item.name,
            mediaUrl: item.mediaUrl,
            previewUrl: item.previewUrl,
          })
        } else {
          const files = item.getFiles ? await item.getFiles() : {}
          const Comp = item.component

          resolvedDemos.push({
            key,
            type: "react",
            name: item.name,
            renderMode,
            embedUrl: renderMode === "iframe" ? `/embed/${key}` : undefined,
            // ✨ CRITICAL PERF FIX: Do not execute component if rendering via iframe
            component: renderMode === "direct" && Comp ? <Comp /> : null,
            files,
            installCommand: item.installCommand || "",
            previewUrl: item.previewUrl,
          })
        }
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
    lastModifiedTime = "May 2, 2026"
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

  const entitySchema = isPaid
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${page.data.title} Component`,
        description: page.data.description,
        brand: {
          "@type": "Brand",
          name: "SATIS UI",
        },
        offers: {
          "@type": "Offer",
          url: gumroadLink,
          priceCurrency: "USD",
          price: price,
          availability: "https://schema.org/InStock",
        },
      }
    : {
        "@context": "https://schema.org",
        "@type": "SoftwareSourceCode",
        name: `${page.data.title} Component`,
        description: page.data.description,
        programmingLanguage: "TypeScript",
        codeSampleType: "UI Component",
      }

  return (
    <>
      <DocTracker
        title={page.data.title}
        category={page.data.category?.[0]}
        badge={page.data.badge}
        isPaid={isPaid}
        price={price}
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
              isPaid={isPaid}
              gumroadUrl={gumroadLink}
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
              {/* ✨ INJECTED COPY BUTTON HERE */}
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

            <div className="mt-2 flex flex-col-reverse items-start justify-start gap-4">
              <CopyMdxButton rawMdx={copyPayload} />
            </div>
          </header>

          <div
            id="installation"
            className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-32"
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

            <aside className="sticky top-24 no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
              <TableOfContents items={page.data.toc} />
            </aside>
          </div>
        </article>
      </div>
    </>
  )
}
