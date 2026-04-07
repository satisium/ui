// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    // We extend the default schema to include UI Library specific frontmatter
    schema: pageSchema.extend({
      component: z.boolean().default(false).describe("Is this a UI component page?"),
      status: z.enum(["new", "updated", "deprecated", "beta", "stable"]).optional(),
      badge: z.string().optional().describe("E.g., 'New', 'Updated'"),
      author: z.string().optional(),
      date: z.string().optional(),
      // External references crucial for UI libraries
      links: z.object({
        preview: z.string().url().optional().describe("Live preview URL"),
        github: z.string().url().optional().describe("Source code URL"),
        api: z.string().url().optional().describe("API Reference URL")
      }).optional(),
      // Tech stack flags
      stack: z.array(z.string()).optional().describe("e.g., ['framer-motion', 'tailwind']")
    })
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
