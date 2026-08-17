export const scatterTrailAvatarsDemoString = `
import ScatterTrail from "@/components/satisium-ui/scatter-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/16.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/17.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/18.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/19.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/20.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/21.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/22.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/23.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/24.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/25.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/26.png",
]

export default function ScatterTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Scatter Cards.
        </h1>
      </div>

      <ScatterTrail
        imageUrls={trailImages}
        distance={40}
        itemSize={100}
        maxItems={20}
        duration={1500}
        slideMultiplier={120}
        maxSlide={400}
        scatterSpread={0.7}
      />
    </main>
  )
}`

export const scatterTrailImagesDemoString = `
import ScatterTrail from "@/components/satisium-ui/scatter-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/14.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/17.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/18.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/19.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/20.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/21.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/22.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/23.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/24.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/25.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/26.jpg",
]

export default function ScatterTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Scatter Cards.
        </h1>
      </div>

      <ScatterTrail
        imageUrls={trailImages}
        distance={45} 
        itemSize={130} 
        maxItems={20}
        duration={1600} 
        slideMultiplier={150} 
        maxSlide={500}
        scatterSpread={0.8} 
        itemClassName="border-4 border-border" 
      />
    </main>
  )
}`

export const scatterTrailString = `"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface ScatterTrailProps {
  imageUrls: string[]
  distance?: number
  duration?: number
  maxItems?: number
  itemSize?: number
  slideMultiplier?: number
  maxSlide?: number
  scatterSpread?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  startX: number
  startY: number
  targetX: number
  targetY: number
  startRotation: number
  targetRotation: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function ScatterTrail({
  imageUrls,
  distance = 40,
  duration = 1500,
  maxItems = 20,
  itemSize = 100,
  slideMultiplier = 120,
  maxSlide = 400,
  scatterSpread = 0.7,
  className,
  itemClassName = "",
}: ScatterTrailProps) {
  const reqRef = useRef<number | null>(null)
  
  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      startRotation: 0,
      targetRotation: 0,
      imageIndex: 0,
      zIndex: 0,
      t: 0,
      state: "enter",
      holdTime: 0,
      spawnTime: 0,
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef({
    lastDropPos: { x: -1000, y: -1000 },
    lastMovePos: { x: -1000, y: -1000 },
    lastMoveTime: 0,
    spawnCount: 0,
    lastFrameTime: 0,
  })

  const config = useRef({ imageUrls, distance, maxItems, duration, itemSize, slideMultiplier, maxSlide, scatterSpread })
  useEffect(() => {
    config.current = { imageUrls, distance, maxItems, duration, itemSize, slideMultiplier, maxSlide, scatterSpread }
  }, [imageUrls, distance, maxItems, duration, itemSize, slideMultiplier, maxSlide, scatterSpread])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      const now = Date.now()

      if (s.lastMovePos.x === -1000) {
        s.lastMovePos = { x: e.clientX, y: e.clientY }
        s.lastMoveTime = now
        return
      }

      const moveDx = e.clientX - s.lastMovePos.x
      const moveDy = e.clientY - s.lastMovePos.y
      const dt = Math.max(now - s.lastMoveTime, 1)
      const vx = moveDx / dt
      const vy = moveDy / dt

      s.lastMovePos = { x: e.clientX, y: e.clientY }
      s.lastMoveTime = now

      const dropDx = e.clientX - s.lastDropPos.x
      const dropDy = e.clientY - s.lastDropPos.y
      const dropDistance = Math.hypot(dropDx, dropDy)

      if (dropDistance >= c.distance) {
        const activeNonExiting = pool.current.filter(
          (p) => p.active && p.state !== "exit"
        )

        if (activeNonExiting.length >= c.maxItems) {
          activeNonExiting.sort((a, b) => a.spawnTime - b.spawnTime)
          const oldest = activeNonExiting[0]
          oldest.state = "exit"
        }

        const freeIndex = pool.current.findIndex((p) => !p.active)
        
        if (freeIndex !== -1) {
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          const speed = Math.hypot(vx, vy)
          const slideDistance = Math.min(speed * c.slideMultiplier, c.maxSlide)

          const baseAngle = Math.atan2(vy, vx)
          const spreadAngle = baseAngle + (Math.random() - 0.5) * c.scatterSpread

          const targetX = e.clientX + Math.cos(spreadAngle) * slideDistance
          const targetY = e.clientY + Math.sin(spreadAngle) * slideDistance

          const startRotation = (Math.random() - 0.5) * 90
          const spinDirection = Math.random() > 0.5 ? 1 : -1
          const spinAmount = slideDistance * 0.8 * spinDirection

          pool.current[freeIndex] = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            targetX,
            targetY,
            startRotation,
            targetRotation: startRotation + spinAmount,
            imageIndex: s.spawnCount % c.imageUrls.length,
            zIndex: s.spawnCount,
            t: 0,
            state: "enter",
            holdTime: 0,
            spawnTime: Date.now(),
          }
        }
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  useEffect(() => {
    state.current.lastFrameTime = Date.now()

    const animate = () => {
      const c = config.current
      const currentTime = Date.now()
      const delta = Math.min(currentTime - state.current.lastFrameTime, 32)
      state.current.lastFrameTime = currentTime

      const enterDuration = c.duration * 0.35
      const holdDuration = c.duration * 0.45
      const exitDuration = c.duration * 0.2

      for (let i = 0; i < DOM_POOL_SIZE; i++) {
        const item = pool.current[i]
        const domNode = domRefs.current[i]

        if (!domNode) continue
        if (!item.active) {
          domNode.style.display = "none"
          continue
        }

        if (item.state === "enter") {
          item.t += delta / enterDuration
          if (item.t >= 1) {
            item.t = 1
            item.state = "hold"
          }
        } else if (item.state === "hold") {
          item.holdTime += delta
          if (item.holdTime >= holdDuration) {
            item.state = "exit"
          }
        } else if (item.state === "exit") {
          item.t -= delta / exitDuration
          if (item.t <= 0) {
            item.t = 0
            item.active = false
            domNode.style.display = "none"
            continue
          }
        }

        let currentX = item.startX
        let currentY = item.startY
        let currentRotation = item.startRotation
        let scale = 1
        let opacity = 1

        if (item.state === "enter") {
          const easeOutFriction = 1 - Math.pow(1 - item.t, 4)

          currentX = item.startX + (item.targetX - item.startX) * easeOutFriction
          currentY = item.startY + (item.targetY - item.startY) * easeOutFriction
          currentRotation = item.startRotation + (item.targetRotation - item.startRotation) * easeOutFriction

          scale = 0.9 + easeOutFriction * 0.1
        } else if (item.state === "hold") {
          currentX = item.targetX
          currentY = item.targetY
          currentRotation = item.targetRotation
          scale = 1
        } else if (item.state === "exit") {
          currentX = item.targetX
          currentY = item.targetY
          currentRotation = item.targetRotation

          const easeIn = item.t * item.t
          scale = easeIn
          opacity = item.t
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()
        domNode.style.transform = \`
          translate3d(\${currentX}px, \${currentY}px, 0) 
          rotate(\${currentRotation}deg) 
          scale(\${scale})
        \`

        const imagesInside = domNode.querySelectorAll("img")
        imagesInside.forEach((img, idx) => {
          img.style.display = idx === item.imageIndex ? "block" : "none"
        })
      }

      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [DOM_POOL_SIZE])

  useEffect(() => {
    imageUrls.forEach((src) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.referrerPolicy = "no-referrer"
      img.src = src
    })
  }, [imageUrls])

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] h-screen w-screen overflow-hidden",
        className
      )}
    >
      {Array.from({ length: DOM_POOL_SIZE }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            domRefs.current[i] = el
          }}
          className={cn(
            "absolute top-0 left-0 overflow-hidden bg-transparent p-0 drop-shadow-2xl will-change-transform",
            itemClassName
          )}
          style={{
            width: \`\${itemSize}px\`,
            height: \`\${itemSize}px\`,
            marginLeft: \`-\${itemSize / 2}px\`,
            marginTop: \`-\${itemSize / 2}px\`,
            borderRadius: "15%",
            display: "none",
            willChange: "transform, opacity",
          }}
        >
          {imageUrls.map((src, imgIndex) => (
            <img
              key={imgIndex}
              src={src}
              alt="trail"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full rounded-[15%] object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}`

export const scatterTrailFile = {
  "scatter-trail.tsx": {
    code: scatterTrailString,
    language: "tsx",
  },
}
