import { pageSchema } from "fumadocs-core/source/schema"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import { z } from "zod"
import { CategoryEnum } from "./lib/utils"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      component: z.boolean().default(false),

      hideToc: z.boolean().default(false),
      hideCopy: z.boolean().default(false),
      comingSoon: z.boolean().default(false),

      badge: z
        .enum(["new", "updated", "beta", "premium", "deprecated"])
        .optional(),
      category: z.array(CategoryEnum).optional(),
      author: z.string().optional(),
      date: z.string().optional(),
      gumroad: z.string().url().optional(),
      price: z.string().optional(),
      links: z
        .object({
          preview: z.string().url().optional(),
          github: z.string().url().optional(),
        })
        .optional(),
      registryKeys: z.array(z.string()).optional(),
      media: z
        .object({
          image: z.string(),
          video: z.string().optional(),
        })
        .optional(),
    }),
  },
})

export default defineConfig()
