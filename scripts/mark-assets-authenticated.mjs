// scripts/mark-assets-authenticated.mjs
// ⚠️  DANGEROUS: Marks ALL assets in your Cloudinary cloud as "authenticated".
// After running, regular (unsigned) URLs return 401 — only signed URLs work.
//
// ⚠️  CONSEQUENCE: All distributed demo code (registry/strings/*.ts, public/r/*.json)
//     contains hardcoded public Cloudinary URLs. These will STOP working for
//     consumers who install via `shadcn add`. The demo code cannot generate
//     signed URLs without your CLOUDINARY_API_SECRET.
//
//     Your own site (ui.satisium.com) will continue to work because all
//     components fetch signed URLs through /api/cloudinary/signed-url.
//
// Usage:
//   pnpm cloudinary:lockdown            # applies changes + invalidates CDN cache
//   DRY_RUN=1 pnpm cloudinary:lockdown  # list without making changes

import { v2 as cloudinary } from "cloudinary"
import fs from "node:fs"
import path from "node:path"

// ---------------------------------------------------------------------------
// Load .env.local (Node.js doesn't do this automatically like Next.js does)
// ---------------------------------------------------------------------------
function loadEnv() {
  if (process.env.CLOUDINARY_CLOUD_NAME) return

  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const [key, ...valParts] = trimmed.split("=")
    if (!key) continue
    const val = valParts
      .join("=")
      .trim()
      .replace(/^["']|["']$/g, "")
    process.env[key.trim()] = val
  }
}

loadEnv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const DRY_RUN = !!process.env.DRY_RUN
const BATCH_SIZE = 10 // Cloudinary allows up to 100 IDs per call; keep safe
const RATE_LIMIT_DELAY_MS = 1000 // 1s delay between batches to avoid 429s

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function validateCredentials() {
  const missing = []
  if (!process.env.CLOUDINARY_CLOUD_NAME)
    missing.push("CLOUDINARY_CLOUD_NAME")
  if (!process.env.CLOUDINARY_API_KEY)
    missing.push("CLOUDINARY_API_KEY")
  if (!process.env.CLOUDINARY_API_SECRET)
    missing.push("CLOUDINARY_API_SECRET")

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "))
    console.error("   Set them in .env.local or pass them inline.")
    process.exit(1)
  }

  if (
    process.env.CLOUDINARY_API_KEY === "your_api_key_here" ||
    process.env.CLOUDINARY_API_SECRET === "your_api_secret_here"
  ) {
    console.error(
      "❌ Placeholder credentials found in .env.local.\n" +
        "   Get real credentials from Cloudinary Console → Account → API Keys & Secrets."
    )
    process.exit(1)
  }
}

validateCredentials()

async function fetchAllAssets(resourceType) {
  const allAssets = []
  let nextCursor

  do {
    const params = {
      resource_type: resourceType,
      type: "upload",
      max_results: 500,
    }
    if (nextCursor) params.next_cursor = nextCursor

    const result = await cloudinary.api.resources(params)
    allAssets.push(...result.resources)
    nextCursor = result.next_cursor
  } while (nextCursor)

  return allAssets
}

async function fetchAllAssetsNeedingAuth(resourceType) {
  const allAssets = await fetchAllAssets(resourceType)
  const needsAuth = allAssets.filter(
    (a) => a.access_mode !== "authenticated"
  )
  return {
    all: allAssets,
    needsAuth,
    alreadyAuth: allAssets.filter((a) => a.access_mode === "authenticated"),
  }
}

async function authenticateBatch(ids, resourceType) {
  const result = await cloudinary.api.update_resources_access_mode_by_ids(
    "authenticated",
    ids,
    { resource_type: resourceType }
  )

  // Separate successful updates from already-authenticated skips
  const trulyUpdated = []
  const alreadyAuthenticated = []

  for (const updated of result.updated || []) {
    trulyUpdated.push(updated)
  }

  for (const failed of result.failed || []) {
    const errMsg = failed.message || failed.error?.message || "unknown error"
    if (errMsg.toLowerCase().includes("already authenticated")) {
      alreadyAuthenticated.push(failed)
    } else {
      // Genuine error
      throw new Error(
        `Failed to authenticate ${failed.public_id}: ${errMsg}`
      )
    }
  }

  return { updated: trulyUpdated, alreadyAuthenticated }
}

async function invalidateCache(ids, resourceType) {
  // Invalidate CDN cache for assets whose access_mode was just changed.
  // This ensures the CDN doesn't serve stale cached public versions.
  const batchSize = 10
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    const invalidatePromises = batch.map((publicId) =>
      cloudinary.api
        .update(publicId, {
          resource_type: resourceType,
          invalidate: true,
        })
        .catch(() => {}) // Ignore errors — asset may already be invalidated
    )
    await Promise.allSettled(invalidatePromises)
    await sleep(500)
  }
}

async function run() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  console.log(`🔐 Cloudinary Lockdown — cloud: ${cloudName}`)
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "APPLYING changes"}`)
  console.log("")

  // -----------------------------------------------------------------------
  // 1. Discover all video assets
  // -----------------------------------------------------------------------
  console.log("📋 Scanning all video assets...")
  const videoData = await fetchAllAssetsNeedingAuth("video")
  console.log(
    `   Found ${videoData.all.length} total — ${videoData.needsAuth.length} need authentication, ${videoData.alreadyAuth.length} already done`
  )

  // -----------------------------------------------------------------------
  // 2. Discover all image assets
  // -----------------------------------------------------------------------
  console.log("📋 Scanning all image assets...")
  const imageData = await fetchAllAssetsNeedingAuth("image")
  console.log(
    `   Found ${imageData.all.length} total — ${imageData.needsAuth.length} need authentication, ${imageData.alreadyAuth.length} already done`
  )

  console.log("")
  const totalNeedsAuth = videoData.needsAuth.length + imageData.needsAuth.length
  console.log(`📊 Assets requiring authentication: ${totalNeedsAuth}`)
  console.log("")

  let authenticatedCount = 0
  let skippedCount = videoData.alreadyAuth.length + imageData.alreadyAuth.length
  let errorCount = 0
  let invalidatedCount = 0

  for (const { resourceType, data } of [
    { resourceType: "video", data: videoData },
    { resourceType: "image", data: imageData },
  ]) {
    const assetsToProcess = data.needsAuth

    for (let i = 0; i < assetsToProcess.length; i += BATCH_SIZE) {
      const batch = assetsToProcess.slice(i, i + BATCH_SIZE)
      const publicIds = batch.map((a) => a.public_id)

      if (DRY_RUN) {
        publicIds.forEach((id) =>
          console.log(`  [WOULD AUTHENTICATE] ${id} (${resourceType})`)
        )
        authenticatedCount += publicIds.length
        continue
      }

      try {
        const { updated, alreadyAuthenticated } = await authenticateBatch(
          publicIds,
          resourceType
        )

        for (const a of updated) {
          console.log(
            `  [✅ AUTHENTICATED]  ${a.public_id} (${resourceType})`
          )
          authenticatedCount++
        }

        for (const a of alreadyAuthenticated) {
          console.log(
            `  [⏭️  ALREADY DONE]   ${a.public_id} (${resourceType})`
          )
          skippedCount++
        }

        // Invalidate CDN cache for newly authenticated assets
        if (updated.length > 0 && !DRY_RUN) {
          const updatedIds = updated.map((a) => a.public_id)
          await invalidateCache(updatedIds, resourceType)
          invalidatedCount += updatedIds.length
          console.log(`  [🧹 INVALIDATED]   ${updatedIds.length} CDN cache entries`)
        }

        await sleep(RATE_LIMIT_DELAY_MS)
      } catch (err) {
        console.error(
          `  [❌ ERROR]  Batch of ${publicIds.length} ${resourceType} assets — ${err.message}`
        )
        errorCount += publicIds.length
      }
    }
  }

  console.log("")
  console.log("=".repeat(60))
  console.log("SUMMARY")
  console.log("=".repeat(60))
  console.log(`  Total assets scanned:     ${videoData.all.length + imageData.all.length}`)
  console.log(`  Newly authenticated:      ${authenticatedCount}`)
  console.log(`  Already authenticated:    ${skippedCount}`)
  console.log(`  CDN caches invalidated:   ${invalidatedCount}`)
  console.log(`  Errors:                   ${errorCount}`)

  if (errorCount > 0) {
    process.exit(1)
  }
}

run().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
