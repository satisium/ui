import GlassSlices from "@/registry/ui/glass-slices"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function GlassSlicesVideoDemo() {
  const videoUrl =
    "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/2.mp4"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <GlassSlices
          mediaUrl={videoUrl}
          mediaType="video"
          slices={24}
          hoverRadius={0.25}
          minSliceWidth={0.55}
          shiftY={0.1}
          imageZoom={1.15}
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading03Icon}
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
