"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getCloudinaryUrl } from "@/lib/cloudinary" // ✨ Import the utility

export interface CardProps {
  url: string
  title: string
  description?: string
  badge?: "new" | "updated" | "beta" | "deprecated" | string
  media?: {
    image?: string
    video?: string
  }
}

export function ComponentCard({
  url,
  title,
  description,
  badge,
  media,
}: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }, 200)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const badgeType = badge?.toLowerCase()
  const isDeprecated = badgeType === "deprecated"

  // ✨ UNIVERSAL MEDIA RESOLUTION
  // Use video to generate the image thumbnail if it exists, otherwise use image
  const targetMedia = media?.video || media?.image
  const optimizedImage = getCloudinaryUrl(targetMedia, "preview", "image")
  const optimizedVideo = media?.video
    ? getCloudinaryUrl(media.video, "preview", "video")
    : null

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
          {optimizedImage ? (
            <Image
              src={optimizedImage as string}
              alt={title}
              fill
              unoptimized={true}
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[0.65rem] font-medium tracking-widest text-muted-foreground/40 uppercase">
                No Media
              </span>
            </div>
          )}

          {optimizedVideo && (
            <video
              ref={videoRef}
              src={optimizedVideo}
              muted
              loop
              playsInline
              preload="none"
              // ✨ GAP FIX: Synced duration, easing, and scale values perfectly with the Image component
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out-expo group-hover:scale-105 group-hover:opacity-100"
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
