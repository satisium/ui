// app/categories/layout.tsx
import { SpatialLayout } from "@/components/layout/spatial-layout"
import type * as PageTree from "fumadocs-core/page-tree"
import type { Metadata } from "next"
import { TAXONOMY } from "@/lib/utils"
import {
  ArrowLeft,
  LayoutGrid,
  Sparkles,
  Compass,
  Layers,
  BarChart3,
  TextCursorInput,
  BellRing,
  Zap,
  LayoutTemplate,
} from "lucide-react"
import { source } from "@/lib/source"

export const metadata: Metadata = {
  title: "Categories | SATIS UI",
}

const CATEGORY_ICONS: Record<keyof typeof TAXONOMY, React.ReactNode> = {
  marketing: <Sparkles className="size-4" />,
  navigation: <Compass className="size-4" />,
  overlays: <Layers className="size-4" />,
  "data-display": <BarChart3 className="size-4" />,
  forms: <TextCursorInput className="size-4" />,
  feedback: <BellRing className="size-4" />,
  interactions: <Zap className="size-4" />,
  layout: <LayoutTemplate className="size-4" />,
}

function generateCategoryTree(): PageTree.Root {
  const categoryNodes: PageTree.Folder[] = Object.entries(TAXONOMY).map(
    ([category, subcategories]) => {
      const categoryKey = category as keyof typeof TAXONOMY
      const formattedCategory = category.replace("-", " ")

      return {
        type: "folder",
        name:
          formattedCategory.charAt(0).toUpperCase() +
          formattedCategory.slice(1),
        icon: CATEGORY_ICONS[categoryKey],
        index: {
          type: "page",
          name: "Overview",
          url: `/categories/${category}`,
        },
        children: subcategories.map((sub) => {
          const formattedSub = sub.replace("-", " ")
          return {
            type: "page",
            name: formattedSub.charAt(0).toUpperCase() + formattedSub.slice(1),
            url: `/categories/${category}/${sub}`,
          }
        }),
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
        icon: <ArrowLeft className="size-4" />,
      },
      {
        type: "separator",
      },
      {
        type: "page",
        name: "All Categories",
        url: "/categories",
        icon: <LayoutGrid className="size-4" />,
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

  return (
    <SpatialLayout tree={categoryTree} docsTree={source.pageTree}>
      {children}
    </SpatialLayout>
  )
}
