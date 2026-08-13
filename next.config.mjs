// next.config.mjs
import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ]
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://immortal-giraffe-86661.upstash.io https://api.github.com https://res.cloudinary.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
      },
    ]

    return [
      ...securityHeaders.map((header) => ({
        source: "/:path*",
        headers: [header],
      })),
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          ...securityHeaders,
        ],
      },
      {
        source: "/test/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          ...securityHeaders,
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          ...securityHeaders,
        ],
      },
      {
        source: "/preview/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          ...securityHeaders,
        ],
      },
    ]
  },
}

const withMDX = createMDX({})
export default withMDX(config)
