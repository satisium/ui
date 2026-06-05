// lib/media.ts

// 1. Fetch the cloud name from the environment variable
// (Must use NEXT_PUBLIC_ so it is accessible inside "use client" components)
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME

// 2. Developer Experience (DX) check: Warn if it's missing so the app doesn't silently break
if (!CLOUD_NAME) {
  console.warn(
    "⚠️ Warning: NEXT_PUBLIC_CLOUDINARY_NAME is not defined in your environment variables."
  )
}

// 3. Fallback to "demo" (Cloudinary's public test cloud) if undefined, to prevent app crashes
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME || "demo"}`

/**
 * Use Case 1: Avatars
 * Fetches an image, aggressively crops it to a perfect square centered on the face.
 */
export function getAvatarUrl(imageId: string, size: number = 100) {
  // c_thumb = thumbnail crop, g_face = center on face, z_max = zoom on face
  const transforms = `f_auto,q_auto,w_${size},h_${size},c_thumb,g_face,z_0.7`
  return `${BASE_URL}/image/upload/${transforms}/v3/avatars/${imageId}`
}

/**
 * Use Case 2: Demos & Previews (Inside Components)
 * Flexible fetching for hero sections, video backgrounds, etc.
 */
export function getDemoMediaUrl(
  assetId: string,
  type: "image" | "video",
  width: number = 1200
) {
  // ac_none strips audio from videos to save bandwidth
  const audioTransform = type === "video" ? ",ac_none" : ""
  const transforms = `f_auto,q_auto,w_${width},c_limit${audioTransform}`

  return `${BASE_URL}/${type}/upload/${transforms}/v3/demos/${assetId}`
}

/**
 * Use Case 3: Premium Component Placeholders (Anti-Theft)
 * Ultra-high quality, but still compressed. Designed to replace the actual React component.
 */
export function getPlaceholderVideo(componentId: string) {
  // w_1600 ensures it looks crisp on large monitors, q_auto:good forces higher quality
  const transforms = `f_auto,q_auto:good,w_1600,c_limit,ac_none`
  return `${BASE_URL}/video/upload/${transforms}/v3/placeholders/${componentId}.mp4`
}

/**
 * Use Case 4: Thumbnails & YouTube-Style Previews (For your Card Grids)
 * Returns both the low-bandwidth video AND the auto-generated static fallback image.
 */
export function getThumbnailMedia(componentId: string) {
  const transforms = `f_auto,q_auto,w_800,c_limit,ac_none`

  return {
    // The video that plays on hover
    video: `${BASE_URL}/video/upload/${transforms}/v3/components/${componentId}.mp4`,
    // Cloudinary automatically grabs a frame from the middle of the video (so_auto) to use as the static JPG
    image: `${BASE_URL}/video/upload/${transforms},so_auto/v3/components/${componentId}.jpg`,
  }
}
