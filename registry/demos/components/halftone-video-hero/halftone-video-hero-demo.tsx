import HalftoneVideoHero from "@/registry/ui/halftone-video-hero"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function HalftoneVideoHeroDemo() {
  const videoUrl =
    "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/2.mp4"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl sm:aspect-[16/9]">
        <HalftoneVideoHero
          videoUrl={videoUrl}
          lines={140}
          pointsPerLine={250}
          maxLineThickness={0.85}
          contrast={1.4}
          hoverRadius={120}
          mouseForce={0.15}
          stiffness={0.015}
          friction={0.92}
          tension={0.25}
          className="dark:bg-foreground dark:text-background"
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="h-6 w-6 animate-spin"
              />
              <span className="text-sm font-medium tracking-wide">
                Buffering Halftone...
              </span>
            </div>
          }
        />
      </div>
    </main>
  )
}
