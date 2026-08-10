import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import z from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TAXONOMY = {
  "text-reveals": [],
  "image-effects": [],
  "fluid-effects": [],
  carousels: [],
  "mouse-trails": [],
  generative: [],
} as const

export const CATEGORIES = Object.keys(
  TAXONOMY
) as readonly (keyof typeof TAXONOMY)[]

export const CategoryEnum = z.enum(
  CATEGORIES as unknown as [string, ...string[]]
)
