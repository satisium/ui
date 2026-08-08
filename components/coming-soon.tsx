import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { NewTwitterIcon } from "@hugeicons/core-free-icons"

export function ComingSoon({ type }: { type: "Blocks" | "Templates" }) {
  return (
    <div className="mt-8 flex flex-col gap-6">
      <p className="max-w-2xl font-sans text-[15px] leading-relaxed text-muted-foreground">
        The {type.toLowerCase()} collection is currently in active development.
      </p>

      <a
        href="https://x.com/iamsatish4564"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-fit items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
      >
        <HugeiconsIcon
          icon={NewTwitterIcon}
          className="size-4 text-foreground/80 transition-colors group-hover:text-foreground"
        />
        <span>Follow for release updates ↗</span>
      </a>
    </div>
  )
}
