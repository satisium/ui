"use client"

import { ArrowUpRightIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"

const LUMEN_HOUSE_URL = "/examples/lumen-house/"

export function LumenHouseExamplePreview() {
  return (
    <section
      aria-labelledby="lumen-house-preview-title"
      className="not-prose my-10 overflow-hidden rounded-3xl border border-border bg-muted p-3 shadow-sm"
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
        <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-[0.65rem] font-bold tracking-widest text-primary uppercase">
              Live example
            </p>
            <h2
              id="lumen-house-preview-title"
              className="mt-1 text-base font-semibold tracking-tight text-foreground"
            >
              Lumen House Photography Studio
            </h2>
          </div>
          <Button asChild size="sm" className="w-full shrink-0 sm:w-auto">
            <a
              href={LUMEN_HOUSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the Lumen House example in a new tab"
            >
              Open in new tab
              <HugeiconsIcon icon={ArrowUpRightIcon} className="size-4" />
            </a>
          </Button>
        </div>
        <div className="relative aspect-[16/10] min-h-[34rem] bg-muted sm:min-h-[42rem] lg:min-h-[48rem]">
          <iframe
            src={LUMEN_HOUSE_URL}
            title="Lumen House Photography Studio example"
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0 bg-background"
          />
        </div>
      </div>
    </section>
  )
}
