// app/categories/layout.tsx
import { SpatialLayout } from "@/components/layout/spatial-layout"
import { source } from "@/lib/source"
import { TAXONOMY } from "@/lib/utils"
import {
  ArrowLeft01Icon,
  ChartLineData02Icon,
  HotelBellIcon,
  InputShortTextIcon,
  Layers01Icon,
  Layout01Icon,
  LayoutTable02Icon,
  NavigationIcon,
  RotateLeft03Icon,
  Store03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type * as PageTree from "fumadocs-core/page-tree"
import type { Metadata } from "next"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Categories | SATIS UI",
}

const CATEGORY_ICONS: Record<keyof typeof TAXONOMY, React.ReactNode> = {
  marketing: <HugeiconsIcon icon={Store03Icon} className="size-5" />,
  navigation: <HugeiconsIcon icon={NavigationIcon} className="size-5" />,
  overlays: <HugeiconsIcon icon={Layers01Icon} className="size-5" />,
  "data-display": (
    <HugeiconsIcon icon={ChartLineData02Icon} className="size-5" />
  ),
  forms: <HugeiconsIcon icon={InputShortTextIcon} className="size-5" />,
  feedback: <HugeiconsIcon icon={HotelBellIcon} className="size-5" />,
  interactions: <HugeiconsIcon icon={RotateLeft03Icon} className="size-5" />,
  layout: <HugeiconsIcon icon={LayoutTable02Icon} className="size-5" />,
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
