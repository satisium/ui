// app/api/telemetry/route.ts
import { NextResponse } from "next/server"

const ALLOWED_ACTIONS = new Set(["web_copy", "page_view"])

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { action, component } = body as { action?: string; component?: string }

    if (!action || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
