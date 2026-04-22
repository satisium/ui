import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TAXONOMY = {
  marketing: ["heroes", "pricing", "feature-sections", "testimonials"],
  navigation: ["sidebars", "navbars", "breadcrumbs", "tabs"],
  overlays: ["modals", "dialogs", "popovers", "tooltips", "drawers"],
  "data-display": ["tables", "lists", "stats", "avatars", "cards"],
  forms: ["inputs", "selects", "toggles", "sliders", "multi-step"],
  feedback: ["toasts", "alerts", "skeletons", "progress", "empty-states"],
  interactions: ["hover-effects", "micro-animations", "magnetic-buttons"],
  layout: ["grids", "masonry", "split-panes"],
} as const

export const CATEGORIES = Object.keys(
  TAXONOMY
) as readonly (keyof typeof TAXONOMY)[]

export const SUBCATEGORIES = Object.values(TAXONOMY).flat() as readonly string[]

export const CategoryEnum = z.enum(
  CATEGORIES as unknown as [string, ...string[]]
)
export const SubCategoryEnum = z.enum(
  SUBCATEGORIES as unknown as [string, ...string[]]
)
