import { SiteFooter } from "@/components/home/site-footer"
import { Button } from "@/components/ui/button"
import { Redis } from "@upstash/redis"
import { Suspense } from "react"
import Link from "next/link"

// ✨ Cache this page so it's blazing fast, but updates stats every 60 seconds (ISR)
export const revalidate = 60

async function PublicMetrics() {
  const redis = Redis.fromEnv()

  // Safely fetch metrics from Redis. The .catch(() => 0) ensures that
  // if Redis hits a rate limit or fails, your website NEVER crashes.
  const [views, webCopies, cliInstalls] = await Promise.all([
    redis
      .get<number>("satis:metrics:page_views")
      .then((r) => r || 0)
      .catch(() => 0),
    redis
      .get<number>("satis:metrics:web_copies")
      .then((r) => r || 0)
      .catch(() => 0),
    redis
      .get<number>("satis:metrics:cli_installs")
      .then((r) => r || 0)
      .catch(() => 0),
  ])

  const totalUsage = webCopies + cliInstalls

  // Formats large numbers nicely (e.g. 1540 -> 1.5k)
  const format = (n: number) =>
    Intl.NumberFormat("en-US", { notation: "compact" }).format(n)

  return (
    <div className="mt-8 mb-4 grid grid-cols-3 gap-4 rounded-2xl border bg-muted/30 p-6">
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-black text-primary">
          {format(totalUsage)}+
        </span>
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Components Used
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-black text-foreground">
          {format(cliInstalls)}+
        </span>
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          CLI Installs
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-black text-foreground">
          {format(views)}+
        </span>
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Page Views
        </span>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col justify-between p-6">
      <div className="flex max-w-xl min-w-0 flex-col gap-4 pt-12 text-sm leading-loose sm:pt-24">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Build faster with SATIS UI
          </h1>
          <p className="text-base text-muted-foreground">
            You may now add components and start building.
          </p>
          <p className="text-base text-muted-foreground">
            We&apos;ve already added the button component for you.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <Link href="/docs/getting-started/introduction">
              <Button size="lg" className="rounded-xl px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="rounded-xl px-8">
                Browse Components
              </Button>
            </Link>
          </div>
        </div>

        {/* ✨ ANALYTICS: Live Redis Stats wrapped in Suspense so it doesn't block the main page load */}
        <Suspense
          fallback={
            <div className="mt-8 h-32 w-full animate-pulse rounded-2xl border bg-muted/50" />
          }
        >
          <PublicMetrics />
        </Suspense>

        <div className="mt-4 font-mono text-xs text-muted-foreground">
          (Press{" "}
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">
            d
          </kbd>{" "}
          to toggle dark mode)
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
