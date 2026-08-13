// app/api/telemetry/route.ts
import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit"

const redis = Redis.fromEnv()

const ALLOWED_ACTIONS = new Set(["web_copy", "page_view"])

export async function POST(req: Request) {
  try {
    if (!checkRateLimit(getClientIdentifier(req))) {
      return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { action, component } = body as { action?: string; component?: string }

    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    if (action === "web_copy") {
      await redis.incr("satisium:metrics:web_copies")
      if (component && typeof component === "string" && component !== "unknown") {
        await redis.zincrby("satisium:metrics:top_components", 1, component)
      }
    } else if (action === "page_view") {
      await redis.incr("satisium:metrics:page_views")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
