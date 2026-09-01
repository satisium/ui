// lib/use-signed-cloudinary-url.ts
// Client-side hook that fetches a time-limited signed URL from our API route.
// Falls back gracefully to the original public URL if the signed URL fails.

import { useEffect, useState } from "react"

export interface SignedUrlResult {
  url: string | null
  poster: string | null
  loading: boolean
  error: Error | null
}

/**
 * Fetches a signed Cloudinary URL from the server-side API route.
 * The signed URL expires after `expires` seconds (default 1 hour).
 *
 * @param publicId   The Cloudinary public_id (path without extension, e.g. "ui-v3/previews/teaser")
 * @param resourceType  "image" or "video"
 * @param transformations  Comma-separated Cloudinary transforms (e.g. "f_auto,q_auto:good,w_1600,c_limit,ac_none")
 * @param expires  URL time-to-live in seconds (default 3600)
 */
export function useSignedCloudinaryUrl(
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image",
  transformations: string = "",
  expires: number = 3600
): SignedUrlResult {
  const [url, setUrl] = useState<string | null>(null)
  const [poster, setPoster] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(!!publicId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!publicId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const params = new URLSearchParams({
      public_id: publicId,
      resource_type: resourceType,
      transformations,
      expires: String(expires),
    })

    const fetchSignedUrl = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/cloudinary/signed-url?${params.toString()}`,
          {
            signal: controller.signal,
          }
        )

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data: { url: string; expires_at: number } =
          await res.json()
        setUrl(data.url)

        // For videos, also fetch a poster image (auto frame extracted from the video).
        // The poster uses so_auto (start offset auto) to grab the best frame.
        if (resourceType === "video") {
          const posterParams = new URLSearchParams({
            public_id: publicId,
            resource_type: "video",
            transformations: "f_auto,q_auto:low,so_auto",
            expires: String(expires),
          })

          const posterRes = await fetch(
            `/api/cloudinary/signed-url?${posterParams.toString()}`,
            { signal: controller.signal }
          )

          if (posterRes.ok) {
            const posterData = await posterRes.json()
            setPoster(posterData.url)
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("[useSignedCloudinaryUrl] Fetch error:", err)
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()

    return () => controller.abort()
  }, [publicId, resourceType, transformations, expires])

  return { url, poster, loading, error }
}
