// app/categories/layout.tsx
import { SpatialLayout } from "@/components/layout/spatial-layout"
import { TAXONOMY } from "@/lib/utils"
import {
  ArrowLeft01Icon,
  Car02Icon,
  Cursor02Icon,
  Image01Icon,
  TextAlignJustifyCenterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as PageTree from "fumadocs-core/page-tree"
import type { Metadata } from "next"
import { SITE_URL } from "@/lib/config"
import { TWITTER_CREATOR } from "@/lib/social-links"

export const metadata: Metadata = {
  title: "Categories | Satisium UI",
  description:
    "Browse our collection of animated UI components. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
  alternates: {
    canonical: `${SITE_URL}/categories`,
  },
  openGraph: {
    title: "Categories | Satisium UI",
    description:
      "Browse our collection of animated UI components. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    images: [{ url: "/api/og?title=Categories", width: 1200, height: 630, alt: "Satisium UI Categories" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories | Satisium UI",
    description:
      "Browse our collection of animated UI components. Built with Tailwind v4, Framer Motion and GSAP for Shadcn UI.",
    creator: TWITTER_CREATOR,
    images: [{ url: "/api/og?title=Categories", width: 1200, height: 630, alt: "Satisium UI Categories" }],
  },
}

const CATEGORY_ICONS: Record<keyof typeof TAXONOMY, React.ReactNode> = {
  carousels: <HugeiconsIcon icon={Car02Icon} className="size-5" />,
  "text-reveals": (
    <HugeiconsIcon icon={TextAlignJustifyCenterIcon} className="size-5" />
  ),
  "image-effects": (
    <HugeiconsIcon icon={Image01Icon} className="size-5" />
  ),
  "mouse-trails": (
    <HugeiconsIcon icon={Cursor02Icon} className="size-5" />
  ),
}

function generateCategoryTree(): PageTree.Root {
  const categoryNodes: PageTree.Folder[] = Object.entries(TAXONOMY).map(
    ([category]) => {
      const formattedCategory = category.replace("-", " ")

      return {
        type: "folder",
        name:
          formattedCategory.charAt(0).toUpperCase() +
          formattedCategory.slice(1),
        icon: CATEGORY_ICONS[category as keyof typeof TAXONOMY],
        index: {
          type: "page",
          name: "Overview",
          url: `/categories/${category}`,
        },
        children: [],
      }
    }
  )

  return {
    name: "Categories",
    children: [
      {
        type: "page",
        name: "Back to Documentation",
        url: "/docs/components",
        icon: <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />,
      },
      {
        type: "separator",
      },
      {
        type: "page",
        name: "All Categories",
        url: "/categories",
      },
      ...categoryNodes,
    ],
  }
}

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const categoryTree = generateCategoryTree()

  return <SpatialLayout tree={categoryTree}>{children}</SpatialLayout>
}