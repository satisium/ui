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

export const metadata: Metadata = {
  title: "Categories | Satisium UI",
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