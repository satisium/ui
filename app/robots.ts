import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/llms.txt", "/llms-full.txt", "/llms/"],
      disallow: ["/api/", "/test/"],
    },
    sitemap: "https://ui.satisium.com/sitemap.xml",
  }
}
