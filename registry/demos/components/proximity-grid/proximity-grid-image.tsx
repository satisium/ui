import ProximityGrid from "@/registry/ui/proximity-grid"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function ProximityGridImageDemo() {
  const imageUrl =
    "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/stock/24.webp"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <ProximityGrid
          mediaUrl={imageUrl}
          mediaType="image"
          columns={10}
          rows={5}
          hoverRadius={4.5}
          imageZoom={2}
          cellRadius={0.2}
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-6 w-6 animate-spin"
              />
              <span className="text-sm font-medium tracking-wide">
                Loading media...
              </span>
            </div>
          }
        />
      </div>
    </main>
  )
}
