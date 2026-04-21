"use client"

import React from "react"
import { motion } from "motion/react"
import { ArrowRight, Compass } from "lucide-react"
import ThreeDDriftingMarquee from "@/registry/ui/3d-drifting-marquee"

const images = [
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop",
    alt: "Road Trip",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
    alt: "Switzerland",
  },
  {
    src: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000&auto=format&fit=crop",
    alt: "Travel",
  },
  {
    src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1000&auto=format&fit=crop",
    alt: "Adventure",
  },
  {
    src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1000&auto=format&fit=crop",
    alt: "Explore",
  },
]

export default function DiagonalHeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background selection:bg-primary/20">
      {/* --- BACKGROUND DIAGONAL MARQUEE --- */}
      <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full">
          <ThreeDDriftingMarquee
            images={images}
            enableEntry={true}
            entryAnimationDelay={1}
            entryAnimationDuration={4.5}
            entryDistance={6000}
            enableWave={true}
            waveHeight={200} // Taller wave looks incredible on a diagonal
            waveProximity={1}
            cardWidth={500}
            cardHeight={300}
            gap={-300}
            maxSkew={35}
            defaultVelocity={1.2}
          />
        </div>
      </div>

      {/* --- FOREGROUND TEXT BLOCKS (From Sketch) --- */}
      <div className="pointer-events-none relative z-0 h-screen w-full p-6 sm:p-12 md:p-16 lg:p-24">
        <div className="flex h-full w-full flex-col items-stretch justify-between">
          {/* TOP-LEFT TEXT BOX */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="pointer-events-auto w-full"
          >
            <h1 className="text-5xl font-bold tracking-tight text-balance text-foreground sm:text-6xl md:text-7xl">
              Capture your memories.
            </h1>
          </motion.div>

          {/* BOTTOM-RIGHT TEXT BOX */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="pointer-events-auto mt-20 max-w-md self-end rounded-3xl border border-border/40 bg-background/40 p-8 text-right shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/20"
          >
            <h2 className="text-3xl font-semibold text-balance text-foreground sm:text-4xl">
              Built with Shadcn
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Every color maps to your root variables. No hardcoded hex values,
              flawless dark mode compatibility, and heavily optimized
              animations.
            </p>

            <div className="mt-8 flex items-center justify-end gap-4">
              <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Documentation
              </button>
              {/* Standard Shadcn Primary Button structure */}
              <button className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95">
                <span>Start Flowing</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
