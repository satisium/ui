import { source } from "@/lib/source"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { findNeighbour } from "fumadocs-core/page-tree"
import { getGithubLastEdit } from "fumadocs-core/content/github"
import { defaultMdxComponents } from "@/components/mdx-components"
import { TableOfContents } from "@/components/layout/toc"

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
    title: `${page.data.title} | Emblemo UI`,
    description: page.data.description,
  }
}

// --------------------------------------------------------
// THE IMMERSIVE CANVAS (Kept perfectly as is)
// --------------------------------------------------------
function FullScreenCanvasPlaceholder({ title }: { title: string }) {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-b border-border/40 bg-background/50"
      aria-label="Component Interactive Preview"
    >
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border/50 bg-background/80 shadow-2xl backdrop-blur-xl">
          <span className="text-3xl">✨</span>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            {title} Preview
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Interactive Canvas
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-in flex-col items-center gap-3 delay-500 duration-1000 fade-in slide-in-from-bottom-4">
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
          Scroll to Manual
        </span>
        <div className="flex h-10 w-6 justify-center rounded-full border border-border bg-background/50 p-1 shadow-sm backdrop-blur-sm">
          <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        </div>
      </div>
    </section>
  )
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
  // FETCH GITHUB LAST MODIFIED
  // ------------------------------------------------------
  let lastModifiedTime: string | null = null

  // We skip this in dev mode to prevent GitHub API rate limits.
  // In production, ensure process.env.GIT_TOKEN is set in your environment.
  if (process.env.NODE_ENV !== "development") {
    try {
      const time = await getGithubLastEdit({
        owner: "your-github-username", // TODO: Replace with your org
        repo: "your-repo-name", // TODO: Replace with your repo
        path: `content/docs/${page.path}`, // Maps to physical file
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
    // Beautiful placeholder for your local development!
    lastModifiedTime = "Apr 7, 2026"
  }

  return (
    <div className="flex w-full animate-in flex-col duration-700 ease-out-expo fade-in">
      {page.data.component && (
        <FullScreenCanvasPlaceholder title={page.data.title} />
      )}

      <article className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-8 py-24 md:px-16 md:pl-24 lg:py-32">
        {/* HEADER SECTION */}
        <header className="flex flex-col gap-4 pb-12">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-start gap-3">
            {page.data.badge && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.7rem] font-bold tracking-wider text-primary uppercase">
                {page.data.badge}
              </span>
            )}
            {page.data.component && (
              <span className="rounded-full border border-border px-3 py-1 text-[0.7rem] font-bold tracking-wider text-muted-foreground uppercase">
                Component API
              </span>
            )}
            {lastModifiedTime && (
              <div className="flex items-center justify-end gap-2 text-muted-foreground">
                <span className="font-mono text-[0.65rem] tracking-widest uppercase">
                  Last Modified:
                </span>
                <span className="font-mono text-[0.75rem] font-medium text-foreground">
                  {lastModifiedTime}
                </span>
              </div>
            )}
          </div>

          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-display-sm">
            {page.data.title}
          </h1>

          <p className="max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
            {page.data.description}
          </p>

          {page.data.stack && page.data.stack.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <span className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Tech Stack //
              </span>
              <div className="flex gap-2">
                {page.data.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-muted px-2.5 py-1 font-mono text-[0.75rem] font-medium text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* SPLIT GRID (MDX + TOC) */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-32">
          <div className="w-full min-w-0 pb-32">
            {/* The Actual Markdown Content */}
            <MDX components={defaultMdxComponents} />

            {/* --- METADATA & PAGINATION SECTION --- */}
            <div className="mt-24 flex flex-col gap-8 border-t border-border/50 pt-10">
              {/* PAGINATION */}
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

          {/* THE FUNCTIONAL TABLE OF CONTENTS */}
          <aside className="sticky top-24 no-scrollbar hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
            {/* Fumadocs automatically extracts the TOC and passes it in page.data.toc */}
            <TableOfContents items={page.data.toc} />
          </aside>
        </div>
      </article>
    </div>
  )
}
