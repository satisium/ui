import HalftoneHero from "@/registry/ui/halftone-hero"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function HalftoneHeroDemo() {
  const imageUrl =
    "https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/13.jpg"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <HalftoneHero
          imageUrl={imageUrl}
          lines={160} // High density lines for detailed image mapping
          pointsPerLine={300} // High vertical resolution
          maxLineThickness={0.9} // Thick, bold mapping
          contrast={1.6} // High contrast
          hoverRadius={200} // Larger interaction area
          stiffness={0.012} // Slightly softer spring for fluid feeling
          className="dark:bg-foreground dark:text-background"
          fallback={
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="h-6 w-6 animate-spin"
              />
              <span className="text-sm font-medium tracking-wide">
                Rendering Halftone...
              </span>
            </div>
          }
        />
      </div>
    </main>
  )
}
