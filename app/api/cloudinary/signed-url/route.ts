// app/api/cloudinary/signed-url/route.ts
// Server-side API route that generates time-limited signed Cloudinary URLs.
// The CLOUDINARY_API_SECRET never leaves the server.

import { cloudinary } from "@/lib/cloudinary-server"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_EXPIRES_SECONDS = 3600 // 1 hour

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const publicId = searchParams.get("public_id")
  const resourceType = (searchParams.get("resource_type") ||
    "image") as "image" | "video"
  const transformations = searchParams.get("transformations") || ""
  const expiresSeconds =
    parseInt(searchParams.get("expires") || "", 10) || DEFAULT_EXPIRES_SECONDS

  if (!publicId) {
    return NextResponse.json(
      { error: "Missing public_id parameter" },
      { status: 400 }
    )
  }

  // Use raw_transformation to pass the transformation string verbatim.
  // The SDK's `transformation` option wraps strings with `t_` (named transform prefix),
  // which breaks inline transformations. `raw_transformation` passes them directly.
  // Examples: "f_auto,q_auto:low" or "f_auto,q_auto:low,ac_none,w_800,c_limit"
  // Also supports named transformations: "t_satisium_preview,f_auto,q_auto:low"

  const expiresAt = Math.floor(Date.now() / 1000) + expiresSeconds

  try {
    const signedUrl = cloudinary.url(publicId, {
      resource_type: resourceType,
      type: "upload",
      sign_url: true,
      expires_at: expiresAt,
      insecure: false,
      timestamp: Math.floor(Date.now() / 1000),
      ...(transformations ? { raw_transformation: transformations } : {}),
    })

    return NextResponse.json({
      url: signedUrl,
      expires_at: expiresAt,
      public_id: publicId,
    })
  } catch (error) {
    console.error("[api/cloudinary/signed-url] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    )
  }
}
