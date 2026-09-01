type MediaVariant = "preview" | "demo"

/**
 * Universal Cloudinary URL Optimizer.
 * Safely applies Named Transformations and chains f_auto/q_auto correctly
 * in a single processing step to prevent pipeline rendering errors.
 */
export function getCloudinaryUrl(
  rawUrl: string | undefined | null,
  variant: MediaVariant,
  outputType: "video" | "image" = "video"
) {
  if (!rawUrl || !rawUrl.includes("cloudinary.com/")) return rawUrl

  const parts = rawUrl.split("/upload/")
  if (parts.length !== 2) return rawUrl

  const base = parts[0]
  let path = parts[1]

  // Strip any legacy/messy inline transformations from the raw URL
  const segments = path.split("/")
  if (segments[0].match(/^[a-z_]+,[a-z_0-9:]+/)) {
    segments.shift()
  }
  path = segments.join("/")

  // Select the named profile (created in your Cloudinary Dashboard)
  const profile =
    variant === "preview" ? "t_satisium_preview" : "t_satisium_demo"
  const quality = variant === "preview" ? "q_auto:low" : "q_auto:good"

  // ----------------------------------------------------------------------
  // CRITICAL FIX: We use a COMMA (,) after ${profile} instead of a slash.
  // This forces Cloudinary to apply all optimizations in ONE processing step.
  // ----------------------------------------------------------------------

  // AI Thumbnail Generator (Extract WebP Image from Video)
  if (outputType === "image" && rawUrl.match(/\.(mp4|mov|webm)$/i)) {
    const pathWithoutExt = path.replace(/\.[^/.]+$/, "")
    // so_auto = Start Offset Auto (AI picks the best thumbnail frame)
    return `${base}/upload/${profile},f_auto,${quality},so_auto/${pathWithoutExt}.webp`
  }

  // Standard Video/Image output
  return `${base}/upload/${profile},f_auto,${quality}/${path}`
}

/**
 * NEW: Get optimized URL with specific width constraint.
 * Use this for images that need explicit size control.
 */
export function getOptimizedCloudinaryUrl(
  rawUrl: string | undefined | null,
  width: number,
  outputType: "video" | "image" = "image",
  quality: "low" | "good" | "eco" = "good"
): string | undefined | null {
  if (!rawUrl || !rawUrl.includes("cloudinary.com/")) return rawUrl

  const parts = rawUrl.split("/upload/")
  if (parts.length !== 2) return rawUrl

  const base = parts[0]
  let path = parts[1]

  // Strip existing transformations
  const segments = path.split("/")
  if (segments[0].match(/^[a-z_]+,[a-z_0-9:]+/)) {
    segments.shift()
  }
  path = segments.join("/")

  const qualityParam = `q_auto:${quality}`

  // Handle video thumbnail extraction
  if (outputType === "image" && rawUrl.match(/\.(mp4|mov|webm)$/i)) {
    const pathWithoutExt = path.replace(/\.[^/.]+$/, "")
    return `${base}/upload/w_${width},${qualityParam},f_auto,so_auto/${pathWithoutExt}.webp`
  }

  return `${base}/upload/w_${width},${qualityParam},f_auto/${path}`
}

/**
 * NEW: Ensure a Cloudinary URL has basic optimizations (f_auto, q_auto).
 * Use this to fix URLs that are missing format/quality auto optimizations.
 */
export function ensureCloudinaryOptimizations(url: string): string {
  if (!url.includes("cloudinary.com/")) return url

  // Check if already has transformations
  if (!url.match(/\/upload\/[cfq_]/)) {
    // No transformations present, add them
    return url.replace("/upload/", "/upload/f_auto,q_auto/")
  }

  let transformed = url

  // Add f_auto if not present
  if (!transformed.match(/[,\/]f_auto/)) {
    transformed = transformed.replace("/upload/", "/upload/f_auto,")
  }

  // Add q_auto if not present (but not q_auto:low or q_auto:good)
  if (!transformed.match(/q_auto/)) {
    transformed = transformed.replace("/upload/", "/upload,q_auto,")
    transformed = transformed.replace("/upload,/", "/upload/")
  }

  return transformed
}

/**
 * NEW: Add width constraint to an existing Cloudinary URL.
 * Replaces any existing width or adds new one.
 */
export function setCloudinaryWidth(url: string, width: number): string {
  if (!url.includes("cloudinary.com/")) return url

  // Remove existing width transformation
  let transformed = url.replace(/,w_\d+/, "").replace(/w_\d+,/, "")

  // Add new width transformation after /upload/
  return transformed.replace("/upload/", `/upload/w_${width},`)
}
