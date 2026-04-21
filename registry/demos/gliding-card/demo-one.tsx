"use client"

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

export default function DriftingMarqueeVelocity() {
  return (
    <ThreeDDriftingMarquee
      images={images}
      defaultVelocity={2.5} // Very fast base speed
      maxSkew={35} // Extreme skew for dramatic effect
      dragFactor={1.5} // Responsive dragging
      cardWidth={400}
      cardHeight={250}
      gap={-250}
      enableEntry
      entryDistance={5000}
      waveHeight={150}
      waveProximity={1}
    />
  )
}
