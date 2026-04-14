// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config"
import { pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      component: z
        .boolean()
        .default(false)
        .describe("Is this a UI component page?"),
      status: z.enum(["new", "updated", "deprecated", "beta"]).optional(),
      badge: z.string().optional().describe("E.g., 'New', 'Updated'"),
      author: z.string().optional(),
      date: z.string().optional(),

      links: z
        .object({
          preview: z.string().url().optional().describe("Live preview URL"),
          github: z.string().url().optional().describe("Source code URL"),
          api: z.string().url().optional().describe("API Reference URL"),
        })
        .optional(),

      registryKeys: z
        .array(z.string())
        .optional()
        .describe("Keys mapping to our registry demos"),

      stack: z
        .array(z.string())
        .optional()
        .describe("e.g., ['framer-motion', 'tailwind']"),
    }),
  },
})

export default defineConfig()
