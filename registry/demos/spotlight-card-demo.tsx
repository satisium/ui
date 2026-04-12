"use client"

import { SpotlightCard } from "@/registry/ui/spotlight-card"

export default function SpotlightCardDemo({
  glowColor = "rgba(255, 255, 255, 0.1)",
  glowRadius = 350,
}: {
  glowColor?: string
  glowRadius?: number
}) {
  return (
    <div className="flex w-full items-center justify-center p-8 md:p-12">
      <SpotlightCard
        glowColor={glowColor}
        glowRadius={glowRadius}
        className="flex min-h-[320px] w-full max-w-[400px] flex-col justify-between p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-background/50 shadow-inner">
          <span className="text-xl">✨</span>
        </div>

        <div className="mt-12">
          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Spatial Awareness.
          </h3>
          <p className="mt-4 font-body leading-relaxed text-muted-foreground">
            We orchestrate the DOM. We don't just put things in boxes; we
            respect the physical laws of the digital canvas.
          </p>
        </div>
      </SpotlightCard>
    </div>
  )
}
