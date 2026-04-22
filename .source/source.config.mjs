// source.config.ts
import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z as z2 } from "zod";

// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";
var TAXONOMY = {
  marketing: ["heroes", "pricing", "feature-sections", "testimonials"],
  navigation: ["sidebars", "navbars", "breadcrumbs", "tabs"],
  overlays: ["modals", "dialogs", "popovers", "tooltips", "drawers"],
  "data-display": ["tables", "lists", "stats", "avatars", "cards"],
  forms: ["inputs", "selects", "toggles", "sliders", "multi-step"],
  feedback: ["toasts", "alerts", "skeletons", "progress", "empty-states"],
  interactions: ["hover-effects", "micro-animations", "magnetic-buttons"],
  layout: ["grids", "masonry", "split-panes"]
};
var CATEGORIES = Object.keys(
  TAXONOMY
);
var SUBCATEGORIES = Object.values(TAXONOMY).flat();
var CategoryEnum = z.enum(
  CATEGORIES
);
var SubCategoryEnum = z.enum(
  SUBCATEGORIES
);

// source.config.ts
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      component: z2.boolean().default(false),
      badge: z2.enum(["new", "updated", "beta", "deprecated"]).optional(),
      category: z2.array(CategoryEnum).optional(),
      subcategory: z2.array(SubCategoryEnum).optional(),
      author: z2.string().optional(),
      date: z2.string().optional(),
      links: z2.object({
        preview: z2.string().url().optional(),
        github: z2.string().url().optional(),
        api: z2.string().url().optional()
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
