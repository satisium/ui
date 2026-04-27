import { cn } from "@/lib/utils"
import * as allHugeicons from "@hugeicons/core-free-icons"
import { CoinsDollarIcon } from "@hugeicons/core-free-icons"
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
        file(node, file) {
          if (!file) return node

          const sourceFile = this.storage.read(file)
          const meta = sourceFile?.data as { badge?: string } | undefined

          if (meta?.badge) {
            const badgeType = meta.badge.toLowerCase()
            const isDeprecated = badgeType === "deprecated"
            const isPremium = badgeType === "premium" || badgeType === "paid"

            node.name = (
              <span className="group flex items-center gap-2">
                <span
                  className={cn(
                    "transition-colors",
                    isDeprecated &&
                      "text-muted-foreground line-through opacity-60"
                  )}
                >
                  {node.name}
                </span>

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

                  {isPremium && (
                    <span
                      className="flex items-center justify-center text-primary"
                      title="Pro Component"
                    >
                      <HugeiconsIcon
                        icon={CoinsDollarIcon}
                        className="size-5"
                      />
                    </span>
                  )}
                </span>
              </span>
            )
          }

          return node
        },
      },
    }),
  ],
  icon(iconString) {
    if (!iconString) return

    let iconKey = iconString

    // Smart DX Format: If user writes "coins-dollar" in MDX, convert it to "CoinsDollarIcon"
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

    // Render the matching Hugeicon dynamically
    if (iconKey in allHugeicons) {
      const iconObj = allHugeicons[iconKey as keyof typeof allHugeicons]
      return createElement(HugeiconsIcon, { icon: iconObj as any })
    }
  },
})
