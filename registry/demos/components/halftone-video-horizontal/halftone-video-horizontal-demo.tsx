import HalftoneVideoHorizontal from "@/registry/ui/halftone-video-horizontal"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function HalftoneVideoHorizontalDemo() {
  const videoUrl =
    "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/2.mp4"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl sm:aspect-[16/9]">
        <HalftoneVideoHorizontal
          videoUrl={videoUrl}
          lines={100} // Tuned for beautiful horizontal video parsing
          pointsPerLine={200}
          maxLineThickness={0.9}
          contrast={1.4}
          hoverRadius={160} // Large wave radius
          mouseForce={0.2} // Powerful Y-axis push
          stiffness={0.012} // Softer, more liquid spring
          friction={0.85} // Slower settling
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
