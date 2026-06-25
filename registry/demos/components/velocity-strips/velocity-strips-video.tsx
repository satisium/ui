"use client"

import VelocityStrips from "@/registry/ui/velocity-strips"
import { Loading02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const videoUrl =
  "https://res.cloudinary.com/ddon6aux0/video/upload/f_auto,q_auto/v1782129926/ui-v3/demos/videos/1.mp4"

export default function VelocityStripsVideoDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <div className="relative aspect-4/3 w-full max-w-5xl overflow-hidden sm:aspect-video">
        <VelocityStrips
          mediaUrl={videoUrl}
          mediaType="video"
          slices={20}
          hoverRadius={0.4}
          shiftMultiplier={0.8}
          trackingSpeed={1.0}
          imageZoom={1}
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
