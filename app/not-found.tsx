// app/not-found.tsx
import Link from "next/link"
import { ArrowLeft, Component } from "lucide-react"

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="group flex w-full max-w-lg flex-col items-center text-center">
        {/* 1. The "Empty Slot" Visual */}
        <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-border/60 bg-muted/30 transition-colors duration-500 group-hover:border-border group-hover:bg-muted/50">
          <Component
            className="size-8 text-muted-foreground/50 transition-transform duration-500 ease-out-expo group-hover:scale-110"
            strokeWidth={1.5}
          />
          {/* Spatial Glow */}
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* 2. Taxonomy Breadcrumb (Meta touch) */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/20 px-3 py-1 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60"></span>
            <span className="relative inline-flex size-1.5 rounded-full bg-destructive"></span>
          </span>
          <span className="font-mono text-[0.65rem] font-bold tracking-widest text-muted-foreground uppercase">
            Error 404 / Unresolved Node
          </span>
        </div>

        {/* 3. Pure Typographical Hierarchy */}
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-display-sm">
          Component Missing
        </h1>

        {/* Notice the leading-7 from our previous typography lessons */}
        <p className="mt-4 max-w-sm font-body text-base leading-7 text-muted-foreground">
          The interface element or documentation path you are searching for does
          not exist in the current tree.
        </p>

        {/* 4. Frictionless Escape Route */}
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/docs/getting-started/introduction"
            className="group/btn relative flex h-10 items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 font-medium text-background transition-all hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 ease-out-expo group-hover/btn:-translate-x-1" />
            <span>Return to Docs</span>
          </Link>

          <Link
            href="/categories"
            className="flex h-10 items-center justify-center rounded-full px-4 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-border focus-visible:outline-none"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </div>
  )
}
