// app/api/og/route.tsx
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // Grab the title from the URL, fallback to SATIS UI
    const title = searchParams.get("title") || "SATIS UI"

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b", // Tailwind zinc-950
          backgroundImage:
            "radial-gradient(circle at 50% -20%, #27272a 0%, transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* BRANDING */}
          <h2
            style={{
              fontSize: 32,
              letterSpacing: "0.2em",
              color: "#a1a1aa", // zinc-400
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            SATIS UI
          </h2>

          {/* DYNAMIC TITLE */}
          <h1
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            {title}
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              fontSize: 32,
              color: "#71717a", // zinc-500
              marginTop: 40,
            }}
          >
            React • Tailwind v4 • Framer Motion
          </p>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
