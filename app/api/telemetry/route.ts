// app/api/telemetry/route.ts
import { NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function POST(req: Request) {
  try {
    const { action, component } = await req.json()

    if (action === "web_copy") {
      await redis.incr("satisium:metrics:web_copies")
      if (component && component !== "unknown") {
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
