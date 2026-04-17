import { docs } from "collections/server"
import { loader } from "fumadocs-core/source"
import { icons } from "lucide-react"
import { createElement } from "react"
import { cn } from "@/lib/utils"

// See https://fumadocs.vercel.app/docs/headless/source-api/plugins for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  // 1. Correctly using the `typedPlugin` signature
  plugins: ({ typedPlugin }) => [
    typedPlugin({
      transformPageTree: {
        // 2. Standard function syntax `file(...)` preserves the `this` binding
        file(node, file) {
          if (!file) return node

          // 3. Access the original (unfiltered) file data using the API context
          const sourceFile = this.storage.read(file)

          // Strongly type our expected frontmatter based on our custom schema
          const meta = sourceFile?.data as { badge?: string } | undefined

          if (meta?.badge) {
            const badgeType = meta.badge.toLowerCase()
            const isDeprecated = badgeType === "deprecated"

            node.name = (
              <span className="group flex items-center gap-2">
                {/* Text styling (strikethrough if deprecated) */}
                <span
                  className={cn(
                    "transition-colors",
                    isDeprecated &&
                      "text-muted-foreground line-through opacity-60"
                  )}
                >
                  {node.name}
                </span>

                {/* Render intent-driven dots based on the badge type */}
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
              </span>
            )
          }

          return node
        },
      },
    }),
  ],
  icon(icon) {
    if (!icon) {
      return
    }
    if (icon in icons) return createElement(icons[icon as keyof typeof icons])
  },
})
