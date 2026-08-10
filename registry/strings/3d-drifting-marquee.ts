export const threeDDriftingMarqueeDemoString = `
"use client"

import { ThreeDDriftingMarquee } from "@/registry/ui/3d-drifting-marquee"

const IMAGES = [
  {
    id: "1",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1782906341/ui-v3/demos/images/12.jpg",
    alt: "Demo image 1",
  },
  {
    id: "2",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/13.jpg",
    alt: "Demo image 2",
  },
  {
    id: "3",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/14.jpg",
    alt: "Demo image 3",
  },
  {
    id: "4",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/15.jpg",
    alt: "Demo image 4",
  },
  {
    id: "5",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/9.jpg",
    alt: "Demo image 5",
  },
  {
    id: "6",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/17.jpg",
    alt: "Demo image 6",
  },
  {
    id: "7",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/18.jpg",
    alt: "Demo image 7",
  },
  {
    id: "8",
    src: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/19.jpg",
    alt: "Demo image 8",
  },
]

export default function ThreeDDriftingMarqueeDemo() {
  return (
    <main className="flex h-screen w-full flex-col bg-background text-foreground">
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Drag to spin, scroll to accelerate, hover to wave.
        </p>
      </section>

      <section className="relative h-[60vh] w-full">
        <ThreeDDriftingMarquee
          images={IMAGES}
          cardWidth={320}
          cardHeight={240}
          gap={-140}
          defaultVelocity={0.8}
          maxSkew={12}
          dragFactor={1.0}
          enableEntry={true}
          entryAnimationDelay={0.3}
          entryAnimationDuration={2.0}
          entryDistance={1500}
          enableWave={true}
          waveHeight={35}
          waveProximity={2}
        />
      </section>
    </main>
  )
}
`

export const threeDDriftingMarqueeString = `
"use client"

import React, { useRef, useEffect, useState } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useAnimationFrame,
  useVelocity,
  useScroll,
  PanInfo,
  animate,
  MotionValue,
} from "motion/react"
import { cn } from "@/lib/utils"

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export interface MarqueeImage {
  src: string
  alt: string
}

export interface ThreeDDriftingMarqueeProps {
  images: MarqueeImage[]
  className?: string
  cardClassName?: string
  cardWidth?: number
  cardHeight?: number
  gap?: number
  defaultVelocity?: number
  maxSkew?: number
  dragFactor?: number
  pauseOnHover?: boolean
  enableEntry?: boolean
  entryAnimationDelay?: number
  entryAnimationDuration?: number
  entryDistance?: number
  enableWave?: boolean
  waveHeight?: number
  waveProximity?: number
  waveSpringConfig?: { stiffness: number; damping: number }
}

const ThreeDDriftingMarquee: React.FC<ThreeDDriftingMarqueeProps> = ({
  images,
  className,
  cardClassName,
  cardWidth = 384,
  cardHeight = 288,
  gap = -160,
  defaultVelocity = 1.0,
  maxSkew = 15,
  dragFactor = 1.2,
  pauseOnHover = true,
  enableEntry = false,
  entryAnimationDelay = 0.5,
  entryAnimationDuration = 2.5,
  entryDistance = 2000,
  enableWave = true,
  waveHeight = 40,
  waveProximity = 2,
  waveSpringConfig = { stiffness: 300, damping: 25 },
}) => {
  const cardStep = cardWidth + gap
  const totalWidth = images.length * cardStep
  const min = -totalWidth / 2
  const max = totalWidth / 2

  const baseX = useMotionValue(0)
  const masterVelocity = useMotionValue(0)
  const hoverSpeed = useMotionValue(1)
  const activeHoverIndex = useMotionValue(-1)

  const smoothHover = useSpring(hoverSpeed, { damping: 30, stiffness: 200 })

  const entryX = useMotionValue(enableEntry ? entryDistance : 0)
  const entryVelocity = useVelocity(entryX)

  useEffect(() => {
    if (enableEntry) {
      const controls = animate(entryX, 0, {
        duration: entryAnimationDuration,
        ease: [0.16, 1, 0.3, 1],
        delay: entryAnimationDelay,
      })
      return () => controls.stop()
    }
  }, [
    enableEntry,
    entryX,
    entryAnimationDelay,
    entryAnimationDuration,
    entryDistance,
  ])

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothScrollVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })

  const smoothSkewVelocity = useSpring(masterVelocity, {
    damping: 50,
    stiffness: 300,
  })

  const skewX = useTransform(
    smoothSkewVelocity,
    [-1000, 1000],
    [maxSkew * 1.5, -maxSkew * 1.5],
    { clamp: true }
  )

  const isDragging = useRef(false)
  const directionFactor = useRef<number>(1)
  const swipeVelocity = useRef(0)

  useAnimationFrame((t, delta) => {
    let moveBy = defaultVelocity * (delta / 16)

    const scrollBoost = smoothScrollVelocity.get() * 0.015
    if (scrollBoost < 0) directionFactor.current = -1
    else if (scrollBoost > 0) directionFactor.current = 1

    moveBy += Math.abs(scrollBoost)
    moveBy *= directionFactor.current
    moveBy *= smoothHover.get()

    const currentEntryVel = entryVelocity.get()

    if (isDragging.current) {
      masterVelocity.set(swipeVelocity.current * 10)
    } else {
      swipeVelocity.current *= 0.96

      const totalMove = -moveBy + swipeVelocity.current
      baseX.set(baseX.get() + totalMove)

      masterVelocity.set(
        -moveBy * 5 + swipeVelocity.current * 10 + currentEntryVel * 0.05
      )
    }
  })

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center overflow-visible select-none",
        "[perspective:4000px]",
        className
      )}
    >
      <motion.div
        className="relative flex items-center justify-center [transform-style:preserve-3d]"
        style={{
          width: "100%",
          height: cardHeight + 100,
          rotateY: 45,
          rotateX: -10,
          cursor: isDragging.current ? "grabbing" : "grab",
        }}
        onPanStart={() => {
          isDragging.current = true
          swipeVelocity.current = 0
        }}
        onPan={(e: PointerEvent, info: PanInfo) => {
          baseX.set(baseX.get() + info.delta.x * dragFactor)
          swipeVelocity.current = info.velocity.x * 0.015
        }}
        onPanEnd={() => {
          isDragging.current = false
        }}
      >
        {images.map((image, index) => (
          <Card3D
            key={index}
            index={index}
            image={image}
            baseX={baseX}
            entryX={entryX}
            cardStep={cardStep}
            totalWidth={totalWidth}
            min={min}
            max={max}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            skewX={skewX}
            totalItems={images.length}
            activeHoverIndex={activeHoverIndex}
            setHover={(active) =>
              pauseOnHover && hoverSpeed.set(active ? 0 : 1)
            }
            cardClassName={cardClassName}
            enableWave={enableWave}
            waveHeight={waveHeight}
            waveProximity={waveProximity}
            waveSpringConfig={waveSpringConfig}
          />
        ))}
      </motion.div>
    </div>
  )
}

interface Card3DProps {
  index: number
  image: MarqueeImage
  baseX: MotionValue<number>
  entryX: MotionValue<number>
  cardStep: number
  totalWidth: number
  min: number
  max: number
  cardWidth: number
  cardHeight: number
  skewX: MotionValue<number>
  totalItems: number
  activeHoverIndex: MotionValue<number>
  setHover: (active: boolean) => void
  cardClassName?: string
  enableWave: boolean
  waveHeight: number
  waveProximity: number
  waveSpringConfig: { stiffness: number; damping: number }
}

const Card3D: React.FC<Card3DProps> = ({
  index,
  image,
  baseX,
  entryX,
  cardStep,
  totalWidth,
  min,
  max,
  cardWidth,
  cardHeight,
  skewX,
  totalItems,
  activeHoverIndex,
  setHover,
  cardClassName,
  enableWave,
  waveHeight,
  waveProximity,
  waveSpringConfig,
}) => {
  const x = useTransform(
    [baseX, entryX],
    ([latestBaseX, latestEntryX]: number[]) => {
      const baseOffset = index * cardStep
      const centeredOffset = baseOffset - totalWidth / 2
      const infiniteX = wrap(min, max, latestBaseX + centeredOffset)
      return infiniteX + latestEntryX
    }
  )

  const dist = useTransform(activeHoverIndex, (val) => {
    if (val === -1) return -1
    const d = Math.abs(index - val)
    return Math.min(d, totalItems - d)
  })

  const yOffset = useTransform(dist, (val) => {
    if (!enableWave || val === -1 || val > waveProximity) return 0
    if (val === 0) return -waveHeight

    const ratio = val / (waveProximity + 1)
    const ease = (Math.cos(ratio * Math.PI) + 1) / 2
    return -waveHeight * ease
  })

  const smoothYOffset = useSpring(yOffset, waveSpringConfig)
  const y = useTransform(smoothYOffset, (val) => \`calc(-50% + \${val}px)\`)

  const zIndex = totalItems - index

  return (
    <motion.div
      className={cn(
        "group absolute top-1/2 left-1/2 overflow-hidden rounded-[32px] bg-zinc-900",
        "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/15",
        "will-change-transform",
        cardClassName
      )}
      style={{
        x,
        y,
        width: cardWidth,
        height: cardHeight,
        rotateY: -90,
        skewX: skewX,
        zIndex,
        transformStyle: "preserve-3d",
        marginLeft: -cardWidth / 2,
      }}
      onHoverStart={() => {
        setHover(true)
        activeHoverIndex.set(index)
      }}
      onHoverEnd={() => {
        setHover(false)
        activeHoverIndex.set(-1)
      }}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        draggable={false}
        className="pointer-events-none object-cover opacity-70 mix-blend-luminosity grayscale-[0.8] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:mix-blend-normal group-hover:grayscale-0"
      />

      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-tr from-black/60 via-transparent to-white/10 transition-opacity duration-700 ease-out group-hover:opacity-0" />
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10 ring-inset" />
    </motion.div>
  )
}

export default ThreeDDriftingMarquee
`

export const threeDDriftingMarqueeFile = {
  "3d-drifting-marquee.tsx": {
    code: threeDDriftingMarqueeString,
    language: "tsx",
  },
}
