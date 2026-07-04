export const velocityTrailAvatarsDemoString = `
import VelocityTrail from "@/components/ui/velocity-trail"

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

export default function VelocityTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Velocity.
        </h1>
      </div>

      <VelocityTrail
        imageUrls={trailImages}
        distance={40}
        maxItems={15}
        duration={800} // Short lifespan for a fast, kinetic feel
        itemSize={96}
      />
    </main>
  )
}`

export const velocityTrailImagesDemoString = `

import VelocityTrail from "@/components/ui/velocity-trail"

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

export default function VelocityTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Velocity.
        </h1>
      </div>

      <VelocityTrail
        imageUrls={trailImages}
        distance={40}
        maxItems={15}
        duration={800} // Short lifespan for a fast, kinetic feel
        itemSize={96}
        itemClassName="border-4 border-border rounded-full"
      />
    </main>
  )
}`

export const velocityTrailString = `"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface VelocityTrailProps {
  imageUrls?: string[]
  distance?: number
  duration?: number
  maxItems?: number
  itemSize?: number
  className?: string
  itemClassName?: string
}

interface TileData {
  active: boolean
  x: number
  y: number
  rotation: number
  speed: number
  imageIndex: number
  zIndex: number
  t: number
  state: "enter" | "hold" | "exit"
  holdTime: number
  spawnTime: number
}

export default function VelocityTrail({
  imageUrls = [],
  distance = 40,
  duration = 800,
  maxItems = 15,
  itemSize = 96,
  className,
  itemClassName = "",
}: VelocityTrailProps) {
  const reqRef = useRef<number | null>(null)

  const DOM_POOL_SIZE = maxItems * 3

  const pool = useRef<TileData[]>(
    Array.from({ length: DOM_POOL_SIZE }, () => ({
      active: false,
      x: 0,
      y: 0,
      rotation: 0,
      speed: 0,
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

  const config = useRef({ imageUrls, distance, maxItems, duration, itemSize })
  useEffect(() => {
    config.current = { imageUrls, distance, maxItems, duration, itemSize }
  }, [imageUrls, distance, maxItems, duration, itemSize])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const s = state.current
      const c = config.current
      const now = Date.now()

      if (c.imageUrls.length === 0) return

      if (s.lastMovePos.x === -1000) {
        s.lastMovePos = { x: e.clientX, y: e.clientY }
        s.lastMoveTime = now
        return
      }

      const moveDx = e.clientX - s.lastMovePos.x
      const moveDy = e.clientY - s.lastMovePos.y
      const moveDistance = Math.hypot(moveDx, moveDy)
      const dt = Math.max(now - s.lastMoveTime, 1)

      const speed = Math.min(moveDistance / dt, 5)

      const trajectoryAngle = Math.atan2(moveDy, moveDx) * (180 / Math.PI)

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
          oldest.t = 0 
        }

        const freeIndex = pool.current.findIndex((p) => !p.active)
        if (freeIndex !== -1) {
          s.lastDropPos = { x: e.clientX, y: e.clientY }
          s.spawnCount += 1

          pool.current[freeIndex] = {
            active: true,
            x: e.clientX,
            y: e.clientY,
            rotation: trajectoryAngle, 
            speed: speed, 
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

      const enterDuration = c.duration * 0.2
      const holdDuration = c.duration * 0.5
      const exitDuration = c.duration * 0.3

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
            item.t = 0
          }
        } else if (item.state === "exit") {
          item.t += delta / exitDuration
          if (item.t >= 1) {
            item.t = 1
            item.active = false
            domNode.style.display = "none"
            continue
          }
        }

        let baseScale = 1
        let scaleX = 1
        let scaleY = 1
        let opacity = 1
        let blurAmount = 0

        if (item.state === "enter") {
          const easeOut = 1 - Math.pow(1 - item.t, 3)
          baseScale = easeOut

          const stretchFactor = item.speed * 1.5
          scaleX = 1 + stretchFactor * (1 - easeOut)
          scaleY = 1 - Math.min(stretchFactor * 0.15 * (1 - easeOut), 0.6)

          blurAmount = item.speed * 2 * (1 - easeOut)
          opacity = easeOut
        } else if (item.state === "hold") {
          baseScale = 1
          scaleX = 1
          scaleY = 1
          opacity = 1
        } else if (item.state === "exit") {
          const easeIn = 1 - item.t
          baseScale = easeIn * easeIn
          scaleX = 1 + item.speed * 0.5 * (1 - baseScale)
          scaleY = 1
          opacity = easeIn
        }

        domNode.style.display = "flex"
        domNode.style.zIndex = item.zIndex.toString()
        domNode.style.opacity = opacity.toString()

        domNode.style.filter = blurAmount > 0 ? \`blur(\${blurAmount}px)\` : "none"

        domNode.style.transform = \`
          translate3d(\${item.x}px, \${item.y}px, 0) 
          rotate(\${item.rotation}deg) 
          scaleX(\${baseScale * scaleX})
          scaleY(\${baseScale * scaleY})
        \`

        const imagesInside = domNode.querySelectorAll<HTMLImageElement>("img.js-trail-img")
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
            "absolute top-0 left-0 origin-center overflow-hidden bg-transparent p-0 drop-shadow-2xl will-change-transform",
            itemClassName
          )}
          style={{
            width: \`\${itemSize}px\`,
            height: \`\${itemSize}px\`,
            marginLeft: \`-\${itemSize / 2}px\`,
            marginTop: \`-\${itemSize / 2}px\`,
            display: "none",
            willChange: "transform, filter, opacity",
          }}
        >
          {imageUrls.map((src, imgIndex) => (
            <img
              key={imgIndex}
              src={src}
              alt="trail"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              decoding="async"
              className="js-trail-img absolute inset-0 h-full w-full object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}`

export const velocityTrailFile = {
  "velocity-trail.tsx": {
    code: velocityTrailString,
    language: "tsx",
  },
}
