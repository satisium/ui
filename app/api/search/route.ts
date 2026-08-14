import { NextResponse } from "next/server"
import { source } from "@/lib/source"
import { createSearchAPI } from "fumadocs-core/search/server"
import { checkRateLimit } from "@/lib/rate-limit"

const searchAPI = createSearchAPI("advanced", {
  indexes: source.getPages().map((page) => ({
    title: page.data.title,
    description: page.data.description,
    structuredData: page.data.structuredData,
    id: page.url,
    url: page.url,
  })),
})

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  if (!(await checkRateLimit(`search:${ip}`))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  return searchAPI.GET(req)
}
