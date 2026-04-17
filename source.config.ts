import { defineDocs, defineConfig } from "fumadocs-mdx/config"
import { pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"

const CategoryEnum = z.enum([
  "marketing",
  "navigation",
  "overlays",
  "data-display",
  "forms",
  "feedback",
  "interactions",
  "layout",
])

const SubCategoryEnum = z.enum([
  // marketing
  "heroes",
  "pricing",
  "feature-sections",
  "testimonials",
  // navigation
  "sidebars",
  "navbars",
  "breadcrumbs",
  "tabs",
  // overlays
  "modals",
  "dialogs",
  "popovers",
  "tooltips",
  "drawers",
  // data-display
  "tables",
  "lists",
  "stats",
  "avatars",
  "cards",
  // forms
  "inputs",
  "selects",
  "toggles",
  "sliders",
  "multi-step",
  // feedback
  "toasts",
  "alerts",
  "skeletons",
  "progress",
  "empty-states",
  // interactions
  "hover-effects",
  "micro-animations",
  "magnetic-buttons",
  // layout
  "grids",
  "masonry",
  "split-panes",
])

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      component: z
        .boolean()
        .default(false)
        .describe("Is this a UI component page?"),

      badge: z.enum(["new", "updated", "beta", "deprecated"]).optional(),

      category: z
        .array(CategoryEnum)
        .optional()
        .describe("Primary SEO bucket (e.g., ['marketing'])"),

      subcategory: z
        .array(SubCategoryEnum)
        .optional()
        .describe("Specific UI pattern (e.g., ['heroes', 'interactions'])"),

      author: z.string().optional(),
      date: z.string().optional(),

      links: z
        .object({
          preview: z.string().url().optional(),
          github: z.string().url().optional(),
          api: z.string().url().optional(),
        })
        .optional(),

      registryKeys: z
        .array(z.string())
        .optional()
        .describe("Keys mapping to our registry demos"),
    }),
  },
})

export default defineConfig()
