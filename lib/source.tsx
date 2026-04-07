import { docs } from "collections/server"
import { loader } from "fumadocs-core/source"

// See https://fumadocs.vercel.app/docs/headless/source-api/plugins for more info
export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  // 1. We now use the new function signature with `typedPlugin`
  plugins: ({ typedPlugin }) => [
    typedPlugin({
      transformPageTree: {
        // 2. The `file` hook allows us to intercept nodes before they hit the client
        file(node, file) {
          if (!file) return node

          // 3. Access the original (unfiltered) file data using the new API context `this.storage`
          const sourceFile = this.storage.read(file)

          // Strongly type our expected frontmatter based on our custom schema
          const meta = sourceFile?.data as { badge?: string } | undefined

          if (meta?.badge) {
            const badgeType = meta.badge.toLowerCase()

            // 4. Inject Premium JSX directly into the node name.
            // Notice we swapped the hardcoded colors for your Shadcn CSS variables
            // to maintain the seamless, premium design system.
            node.name = (
              <span className="flex items-center gap-2">
                <span>{node.name}</span>

                {/* Render intent-driven dots based on the badge type */}
                {badgeType === "new" ? (
                  // The "New" state: A subtle, pinging primary (orange) dot
                  <span className="relative flex size-1.5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                    <span className="relative inline-flex size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"></span>
                  </span>
                ) : (
                  // The "Updated" or other state: A quiet, static structural dot
                  <span
                    className="size-1.5 rounded-full bg-sidebar-primary-foreground/40"
                    title={meta.badge}
                  />
                )}
              </span>
            )
          }

          return node
        },
      },
    }),
  ],
})
