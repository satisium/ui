// app/api/search/route.ts
import { source } from "@/lib/source"
import { createSearchAPI } from "fumadocs-core/search/server"
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit"

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
  if (!checkRateLimit(getClientIdentifier(req))) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  }

  return searchAPI.GET(req)
}
