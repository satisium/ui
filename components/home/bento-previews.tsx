"use client"

import React, { useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface BentoPreviewCardProps {
  image: string
  video?: string
  className?: string
}

export function BentoPreviewCard({ image, video, className }: BentoPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }, 200) // Slight delay prevents accidental plays when moving mouse quickly over the grid
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0 // Resets video on leave
    }
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  return (
    <div
      className={cn(
        // Outer Shell: bg-muted, zero borders, active press scale
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-background p-2 outline-none transition-transform duration-300 ease-out active:scale-[0.98]",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {/* Inner Media Frame: bg-background, nested radius to create the perfect bezel */}
      <div className="relative h-full w-full shrink-0 overflow-hidden rounded-[1.5rem] bg-background">
        
        {/* The Base Image */}
        <Image
          src={image}
          alt="Component Preview"
          fill
          unoptimized
          className="object-cover transition-transform duration-700 ease-out "
        />

        {/* The Video Overlay */}
        {video && (
          <video
            ref={videoRef}
            src={video}
            muted
            loop
            playsInline
            preload="none"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:opacity-100"
          />
        )}
      </div>
    </div>
  )
}

// --- The Bento Grid Layout Wrapper ---

export function BentoSection() {
  // Demo Data mapped to specific grid positions
  const bentoItems = [
    {
      id: 1,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/15.jpg",
      // Large 2x2 Hero Block
      className: "md:col-span-2 md:row-span-2",
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/16.jpg",
      // Standard 1x1 Block
      className: "md:col-span-1 md:row-span-1",
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/17.jpg",
      // Tall 1x2 Block hugging the right edge
      className: "md:col-span-1 md:row-span-2",
    },
    {
      id: 4,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/18.jpg",
      // Standard 1x1 Block
      className: "md:col-span-1 md:row-span-1",
    },
    {
      id: 5,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/19.jpg",
      // Standard 1x1 Block
      className: "md:col-span-1 md:row-span-1",
    },
    {
      id: 6,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/20.jpg",
      // Wide 2x1 Block
      className: "md:col-span-2 md:row-span-1",
    },
    {
      id: 7,
      image: "https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/21.jpg",
      // Standard 1x1 Block
      className: "md:col-span-1 md:row-span-1",
    },
  ]

  return (
    // bg-transparent ensures it flows natively from the typography section above it
    <section className="relative w-full bg-muted py-24 sm:py-32">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* CSS Grid Architecture */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[300px] lg:gap-6">
          {bentoItems.map((item) => (
            <BentoPreviewCard
              key={item.id}
              image={item.image}
              // Add real video URLs here in production! e.g., video="path/to/demo.mp4"
              className={item.className}
            />
          ))}
        </div>

      </div>
    </section>
  )
}