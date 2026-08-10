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
