import LiquidMarble from "@/registry/ui/liquid-marble"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function LiquidMarbleImageDemo() {
  const imageUrl =
    "https://res.cloudinary.com/ddon6aux0/image/upload/f_auto,q_auto/v1782017462/ui-v3/demos/images/24.jpg"

  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden sm:aspect-[16/9]">
        <LiquidMarble
          mediaUrl={imageUrl}
          mediaType="image"
          hoverRadius={0.3}
          distortionStrength={0.15}
          noiseScale={2.5}
          speed={0.25}
          imageZoom={1.25}
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
