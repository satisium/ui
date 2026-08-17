// next.config.mjs
import { createMDX } from "fumadocs-mdx/next"
import withBundleAnalyzer from "@next/bundle-analyzer"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
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
  async redirects() {
    return [
      {
        source: "/changelog",
        destination: "/docs/getting-started/changelog",
        permanent: true,
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
        permanent: false,
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
        permanent: false,
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
        permanent: false,
      },
    ]
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; media-src 'self' https://res.cloudinary.com; connect-src 'self' https://us.i.posthog.com https://us-assets.i.posthog.com https://api.github.com https://res.cloudinary.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
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
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(withMDX(config))
