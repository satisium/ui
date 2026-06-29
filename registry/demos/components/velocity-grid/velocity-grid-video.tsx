import VelocityGrid from "@/registry/ui/velocity-grid"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function VelocityGridVideoDemo() {
  const videoUrl =
    "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/4.mp4"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <VelocityGrid
          mediaUrl={videoUrl}
          mediaType="video"
          columns={20} // Dense column array
          rows={15} // Dense row array for a beautiful mosaic scale
          hoverRadius={0.8} // Circular wave covering 40% of the screen height
          shiftMultiplier={1.2} // Force multiplier for the UV shift
          trackingSpeed={2.0} // Heavy fluid tracking speed
          imageZoom={1} // Enough edge-bleed margin to prevent tearing
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
