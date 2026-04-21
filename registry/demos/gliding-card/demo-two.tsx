"use client"

import ThreeDDriftingMarquee from "@/registry/ui/3d-drifting-marquee"
import { ArrowRight, Sparkles } from "lucide-react"
import { motion } from "motion/react"

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
]

// Stagger variants for the cinematic text entry
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: i * 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#050505] font-sans text-zinc-50 selection:bg-white/20">
      {/* 1. ATMOSPHERIC LIGHTING */}
      {/* A deep, pure ambient light source that grounds the 3D cards */}
      <div className="pointer-events-none absolute top-[40%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-white/[0.03] blur-[120px]" />

      {/* 2. TYPOGRAPHY LAYER */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 pt-32 text-center md:pt-40 lg:pt-48">
        {/* Eyebrow */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-300 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
          <span>Curated Destinations</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-5xl font-semibold tracking-tighter text-balance text-transparent sm:text-7xl md:text-8xl"
        >
          Wanderlust, <br />
          Redefined.
        </motion.h1>

        {/* Subhead */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="mt-6 max-w-xl text-lg font-light tracking-wide text-balance text-zinc-400 md:text-xl"
        >
          Immerse yourself in a beautifully crafted collection of the world's
          most breathtaking landscapes. Swipe to explore the unknown.
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button className="group relative flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 font-medium text-black transition-transform duration-300 active:scale-95">
            <span>Start Exploring</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Apple-like physical hardware reflection */}
            <div className="absolute inset-0 rounded-full ring-1 ring-black/10 ring-inset" />
          </button>
          <button className="flex h-12 items-center justify-center rounded-full px-8 font-medium text-white transition-colors duration-300 hover:bg-white/5">
            View Gallery
          </button>
        </motion.div>
      </div>

      {/* 3. MARQUEE LAYER */}
      <div className="relative mt-8 flex h-[50vh] w-full max-w-[100vw] flex-grow items-center justify-center md:h-[60vh]">
        {/* Infinite Edge Masking: 
            This is critical. It fades the component smoothly into pure black 
            at the edges of the screen, creating depth of field. */}
        <div className="absolute inset-0 z-20">
          <ThreeDDriftingMarquee
            images={images}
            dragFactor={1.5}
            enableEntry={true}
            // Sequence timing: Text fades in (approx 1s total), then cards fly in
            entryAnimationDelay={0.8}
            entryAnimationDuration={2.8}
            entryDistance={2500}
            // Intelligent DX Props for the wave
            enableWave={true}
            waveHeight={100}
            waveProximity={1} // 3 cards to the left, 3 to the right = 7 card rolling wave
            waveSpringConfig={{ stiffness: 250, damping: 25 }} // Slightly softer, grander wave
            // Adjusted card scale for a majestic hero presence
            cardWidth={500}
            cardHeight={300}
            gap={-250}
            maxSkew={12} // Slightly subtler skew to match the elegant typography
            defaultVelocity={0.6} // Slower, more luxurious auto-scroll
          />
        </div>
      </div>
    </section>
  )
}
