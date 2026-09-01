// lib/media-config.ts

/**
 * Centralized Cloudinary media configuration
 * Define all image/video sizes in one place for consistency
 */

export const MEDIA_SIZES = {
  // Thumbnails (component cards, sidebar previews)
  thumbnail: { width: 400, quality: "q_auto:low" },

  // Medium images (carousels, grids)
  medium: { width: 800, quality: "q_auto:good" },

  // Large images (hero sections, full-width)
  large: { width: 1200, quality: "q_auto:good" },

  // Extra large (fullscreen backgrounds)
  xlarge: { width: 1920, quality: "q_auto:good" },

  // Avatars (small circular images)
  avatar: { width: 100, quality: "q_auto:low" },
} as const

export type MediaSizeKey = keyof typeof MEDIA_SIZES

/**
 * Generate optimized Cloudinary URL with proper transformations
 */
export function getOptimizedUrl(
  publicId: string,
  size: MediaSizeKey,
  options: {
    format?: "auto" | "webp" | "avif" | "jpg"
    resourceType?: "image" | "video"
    startOffset?: string
  } = {}
): string {
  const { format = "auto", resourceType = "image", startOffset } = options
  const config = MEDIA_SIZES[size]
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME || "demo"

  const transformations = [
    `w_${config.width}`,
    config.quality,
    `f_${format}`,
    "c_limit",
  ]

  if (resourceType === "video") {
    transformations.push("ac_none")
    if (startOffset) {
      transformations.push(startOffset)
    }
  }

  const transformStr = transformations.join(",")
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${transformStr}/${publicId}`
}

/**
 * Generate responsive srcset for images
 */
export function getResponsiveSrcSet(
  publicId: string,
  sizes: MediaSizeKey[] = ["medium", "large"]
): string {
  return sizes
    .map((size) => {
      const config = MEDIA_SIZES[size]
      const url = getOptimizedUrl(publicId, size)
      return `${url} ${config.width}w`
    })
    .join(",\n")
}

/**
 * Extract public ID from a Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:[^\/]+\/)?(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i)
  return match ? match[1] : null
}

/**
 * Add or update width transformation on an existing Cloudinary URL
 */
export function setUrlWidth(url: string, width: number): string {
  // Remove existing width transformation
  let transformed = url.replace(/,w_\d+/, "").replace(/w_\d+,/, "")
  // Add new width transformation after /upload/
  return transformed.replace("/upload/", `/upload/w_${width},`)
}

/**
 * Ensure URL has format and quality auto optimizations
 */
export function ensureAutoOptimizations(url: string): string {
  let transformed = url

  // Add f_auto if not present
  if (!transformed.includes("f_auto")) {
    transformed = transformed.replace("/upload/", "/upload/f_auto,")
  }

  // Add q_auto if not present
  if (!transformed.match(/q_auto/)) {
    transformed = transformed.replace("/upload/", "/upload,q_auto,")
    // Clean up: remove the extra comma we just added
    transformed = transformed.replace("/upload,/", "/upload/")
  }

  return transformed
}
