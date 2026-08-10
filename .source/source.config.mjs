// source.config.ts
import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z as z2 } from "zod";

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
var TAXONOMY = {
  "text-reveals": [],
  "image-effects": [],
  carousels: [],
  "mouse-trails": []
};
var CATEGORIES = Object.keys(
  TAXONOMY
);
var CategoryEnum = z.enum(
  CATEGORIES
);

// source.config.ts
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      component: z2.boolean().default(false),
      hideToc: z2.boolean().default(false),
      hideCopy: z2.boolean().default(false),
      comingSoon: z2.boolean().default(false),
      badge: z2.enum(["new", "updated", "beta", "premium", "deprecated"]).optional(),
      category: z2.array(CategoryEnum).optional(),
      author: z2.string().optional(),
      date: z2.string().optional(),
      gumroad: z2.string().url().optional(),
      price: z2.string().optional(),
      links: z2.object({
        preview: z2.string().url().optional(),
        github: z2.string().url().optional()
      }).optional(),
      registryKeys: z2.array(z2.string()).optional(),
      media: z2.object({
        image: z2.string(),
        video: z2.string().optional()
      }).optional()
    })
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
