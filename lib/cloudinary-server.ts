// lib/cloudinary-server.ts
// Server-only Cloudinary SDK configuration.
// This file MUST NOT be imported by any client component.
// It uses CLOUDINARY_API_SECRET which is server-side only.

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export { cloudinary }
