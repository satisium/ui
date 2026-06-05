// components/satis/premium-component-card.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

export interface PremiumCardProps {
  url: string
  title: string
  description?: string
  badge?: "new" | "updated" | "beta" | "deprecated" | string
  media?: {
    image: string
    video?: string
  }
}

export function PremiumComponentCard({
  url,
  title,
  description,
  badge,
  media,
}: PremiumCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // OPTIMIZATION 1: Hover Intent Delay
  const handleMouseEnter = () => {
    // Clear any existing timeout so they don't stack
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Wait 200ms before requesting video bandwidth
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          // Catch and swallow autoplay blocking errors silently
        })
      }
    }, 200) // 200ms is the sweet spot for perceived performance vs intent
  }

  const handleMouseLeave = () => {
    // If they left before 200ms, cancel the video request entirely!
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  // Cleanup timeout if component unmounts while hovered
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  const badgeType = badge?.toLowerCase()
  const isDeprecated = badgeType === "deprecated"

  return (
    <Link href={url} className="block w-full ring-0 outline-none">
      <div
        className="group flex h-full flex-col gap-2 overflow-hidden rounded-3xl bg-muted p-2 transition-transform duration-(--duration-normal) ease-out-expo focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background active:scale-[0.98]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {/* Media Frame */}
        <div className="relative h-60 w-full shrink-0 overflow-hidden rounded-2xl border border-border/50 bg-background">
          {media?.image ? (
            <Image
              src={media.image}
              alt={title}
              fill
              // OPTIMIZATION 2: Bypass Vercel billing limits
              unoptimized={true}
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[0.65rem] font-medium tracking-widest text-muted-foreground/40 uppercase">
                No Media
              </span>
            </div>
          )}

          {media?.video && (
            <video
              ref={videoRef}
              src={media.video}
              muted
              loop
              playsInline
              // OPTIMIZATION 3: Strictly enforce no-preload
              preload="none"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-start gap-1 px-3 py-3.5">
          <div className="flex w-full items-center gap-2">
            <h3
              className={cn(
                "min-w-0 truncate font-heading text-[15px] font-medium transition-colors duration-(--duration-normal) ease-out-expo group-hover:text-primary",
                isDeprecated
                  ? "text-muted-foreground line-through opacity-60 group-hover:opacity-80"
                  : "text-foreground"
              )}
            >
              {title}
            </h3>

            {badgeType && (
              <span className="relative flex shrink-0 items-center justify-center">
                {badgeType === "new" && (
                  <>
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </>
                )}
                {badgeType === "updated" && (
                  <span
                    className="size-1.5 rounded-full bg-blue-500"
                    title="Updated"
                  />
                )}
                {badgeType === "beta" && (
                  <span
                    className="size-1.5 rounded-full bg-amber-500"
                    title="Beta"
                  />
                )}
                {badgeType === "deprecated" && (
                  <span
                    className="size-1.5 rounded-full bg-rose-500/50"
                    title="Deprecated"
                  />
                )}
              </span>
            )}
          </div>

          {description && (
            <p className="mt-1.5 line-clamp-2 font-body text-sm leading-relaxed text-muted-foreground/90">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
