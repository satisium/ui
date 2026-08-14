import { Metadata } from "next"
import { source } from "@/lib/source"
import { defaultMdxComponents } from "@/components/mdx-components"

export const dynamic = "force-static"

export async function generateMetadata(): Promise<Metadata> {
  const page = source.getPage(["getting-started", "privacy"])
  if (!page) return {}

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: "/privacy",
    },
  }
}

export default function PrivacyPage() {
  const page = source.getPage(["getting-started", "privacy"])
  if (!page) return null

  const MDX = page.data.body

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
        {page.data.title}
      </h1>
      <div className="mt-8">
        <MDX components={defaultMdxComponents} />
      </div>
    </div>
  )
}
