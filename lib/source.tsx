import { cn } from "@/lib/utils"
import * as allHugeicons from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { docs } from "collections/server"
import { loader } from "fumadocs-core/source"
import { createElement } from "react"

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  plugins: ({ typedPlugin }) => [
    typedPlugin({
      transformPageTree: {
        // 1. TRANSFORM INDIVIDUAL PAGES
        file(node, file) {
          if (!file) return node

          const sourceFile = this.storage.read(file)
          const meta = sourceFile?.data as
            { badge?: string; comingSoon?: boolean } | undefined

          // Extract only the primitive values to prevent Next.js Server Component crashes
          const badgeVal = meta?.badge
          const comingSoonVal = meta?.comingSoon

          // Attach only the safe primitives
          ;(node as any)._badge = badgeVal
          ;(node as any)._comingSoon = comingSoonVal

          const hasBadge = !!badgeVal
          const isComingSoon = !!comingSoonVal

          if (hasBadge || isComingSoon) {
            const originalName = node.name
            const badgeType = badgeVal?.toLowerCase()
            const isDeprecated = badgeType === "deprecated"

            node.name = (
              <span className="group flex min-w-0 items-center gap-2">
                {/* Original Item Name */}
                <span
                  className={cn(
                    "truncate transition-colors",
                    isDeprecated &&
                      "text-muted-foreground line-through opacity-60"
                  )}
                >
                  {originalName}
                </span>

                {/* ✨ INJECTED: Primary "SOON" Badge (Perfect readability & consistency) */}
                {isComingSoon && (
                  <span className="flex shrink-0 items-center justify-center rounded-[5px] bg-primary px-1.5 py-[1.5px] font-mono text-[9px] font-bold tracking-widest text-primary-foreground uppercase">
                    SOON
                  </span>
                )}

                {/* Suffix Badges */}
                {hasBadge && (
                  <span className="relative flex shrink-0 items-center justify-center">
                    {badgeType === "new" && (
                      <>
                        <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-60"></span>
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                      </>
                    )}
                    {badgeType === "updated" && (
                      <span
                        className="size-1.5 rounded-full bg-blue-500"
                        title="Updated"
                      />
                    )}
                    {badgeType === "beta" && (
                      <span
                        className="size-1.5 rounded-full bg-amber-500"
                        title="Beta"
                      />
                    )}
                    {badgeType === "deprecated" && (
                      <span
                        className="size-1.5 rounded-full bg-rose-500/50"
                        title="Deprecated"
                      />
                    )}
                  </span>
                )}
              </span>
            )
          }

          return node
        },

        // 2. TRANSFORM FOLDERS (Blocks & Templates)
        folder(node) {
          if (node.index) {
            // Read the safe primitive values we attached in the file hook
            const badgeVal = (node.index as any)._badge as string | undefined
            const comingSoonVal = (node.index as any)._comingSoon as
              boolean | undefined

            const hasBadge = !!badgeVal
            const isComingSoon = !!comingSoonVal

            if (hasBadge || isComingSoon) {
              const originalName = node.name
              const badgeType = badgeVal?.toLowerCase()
              const isDeprecated = badgeType === "deprecated"

              node.name = (
                <span className="group flex min-w-0 items-center gap-2">
                  {/* Original Folder Name */}
                  <span
                    className={cn(
                      "truncate transition-colors",
                      isDeprecated &&
                        "text-muted-foreground line-through opacity-60"
                    )}
                  >
                    {originalName}
                  </span>

                  {/* ✨ INJECTED: Primary "SOON" Badge for Folders */}
                  {isComingSoon && (
                    <span className="flex shrink-0 items-center justify-center rounded-[5px] bg-primary px-1.5 py-[1.5px] font-mono text-[9px] font-bold tracking-widest text-primary-foreground uppercase">
                      SOON
                    </span>
                  )}

                  {hasBadge && (
                    <span className="relative flex shrink-0 items-center justify-center">
                      {badgeType === "new" && (
                        <>
                          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-60"></span>
                          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500"></span>
                        </>
                      )}
                      {badgeType === "updated" && (
                        <span
                          className="size-1.5 rounded-full bg-blue-500"
                          title="Updated"
                        />
                      )}
                      {badgeType === "beta" && (
                        <span
                          className="size-1.5 rounded-full bg-amber-500"
                          title="Beta"
                        />
                      )}
                      {badgeType === "deprecated" && (
                        <span
                          className="size-1.5 rounded-full bg-rose-500/50"
                          title="Deprecated"
                        />
                      )}
                    </span>
                  )}
                </span>
              )
            }
          }

          return node
        },
      },
    }),
  ],
  icon(iconString) {
    if (!iconString) return

    let iconKey = iconString

    if (!(iconKey in allHugeicons)) {
      const formatted =
        iconString
          .split("-")
          .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
          .join("") + "Icon"

      if (formatted in allHugeicons) {
        iconKey = formatted
      }
    }

    if (iconKey in allHugeicons) {
      const iconObj = allHugeicons[iconKey as keyof typeof allHugeicons]
      return createElement(HugeiconsIcon, { icon: iconObj as any })
    }
  },
})
