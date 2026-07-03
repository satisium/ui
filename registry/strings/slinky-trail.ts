export const slinkyTrailAvatarsDemoString = `

import SlinkyTrail from "@/components/ui/slinky-trail"

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

export default function SlinkyTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Slinky.
        </h1>
      </div>

      <SlinkyTrail
        imageUrls={trailImages}
        maxItems={12}
        itemSize={110}
        stiffness={0.3}
      />
    </main>
  )
}`

export const slinkyTrailImagesDemoString = `
import SlinkyTrail from "@/components/ui/slinky-trail"

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

export default function SlinkyTrailImagesDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Slinky.
        </h1>
      </div>

      <SlinkyTrail
        imageUrls={trailImages}
        maxItems={8} 
        itemSize={130}
        stiffness={0.25} 
        itemClassName="border-4 border-border rounded-sm"
      />
    </main>
  )
}`

export const slinkyTrailString = `"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface SlinkyTrailProps {
  imageUrls?: string[]
  maxItems?: number
  itemSize?: number
  stiffness?: number
  className?: string
  itemClassName?: string
}

interface NodeData {
  x: number
  y: number
  vx: number
  vy: number
  rx: number
  baseRot: number
  imageIndex: number
}

export default function SlinkyTrail({
  imageUrls = [],
  maxItems = 12,
  itemSize = 110,
  stiffness = 0.3,
  className,
  itemClassName = "",
}: SlinkyTrailProps) {
  const reqRef = useRef<number | null>(null)

  const nodes = useRef<NodeData[]>(
    Array.from({ length: maxItems }, (_, i) => ({
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      rx: 0,
      baseRot: i % 2 === 0 ? i * 2.5 : -i * 2.5,
      imageIndex: i, 
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const mouse = useRef({
    x: -1000,
    y: -1000,
    moved: false,
  })

  const config = useRef({ imageUrls, maxItems, itemSize, stiffness })
  useEffect(() => {
    config.current = { imageUrls, maxItems, itemSize, stiffness }
  }, [imageUrls, maxItems, itemSize, stiffness])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const c = config.current
      if (c.imageUrls.length === 0) return

      mouse.current.x = e.clientX
      mouse.current.y = e.clientY

      if (!mouse.current.moved) {
        mouse.current.moved = true
        for (let i = 0; i < c.maxItems; i++) {
          if (nodes.current[i]) {
            nodes.current[i].x = e.clientX
            nodes.current[i].y = e.clientY
          }
        }
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  useEffect(() => {
    const animate = () => {
      const c = config.current

      if (mouse.current.moved && c.imageUrls.length > 0) {
        for (let i = 0; i < c.maxItems; i++) {
          const node = nodes.current[i]
          const domNode = domRefs.current[i]

          if (!node || !domNode) continue

          const targetX = i === 0 ? mouse.current.x : nodes.current[i - 1].x
          const targetY = i === 0 ? mouse.current.y : nodes.current[i - 1].y

          node.vx = (targetX - node.x) * c.stiffness
          node.vy = (targetY - node.y) * c.stiffness

          node.x += node.vx
          node.y += node.vy

          const targetRot = node.vx * 1.5 
          node.rx += (targetRot + node.baseRot - node.rx) * 0.2

          const scale = 1 - (i / c.maxItems) * 0.25

          domNode.style.display = "flex"
          domNode.style.zIndex = (c.maxItems - i).toString()

          domNode.style.transform = \`
            translate3d(\${node.x}px, \${node.y}px, 0) 
            rotate(\${node.rx}deg) 
            scale(\${scale})
          \`

          const safeImageIndex = node.imageIndex % c.imageUrls.length

          const imagesInside = domNode.querySelectorAll<HTMLImageElement>("img.js-trail-img")
          imagesInside.forEach((img, idx) => {
            img.style.display = idx === safeImageIndex ? "block" : "none"
          })
        }
      }

      reqRef.current = requestAnimationFrame(animate)
    }

    reqRef.current = requestAnimationFrame(animate)
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [])

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
      {Array.from({ length: maxItems }).map((_, i) => (
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
            borderRadius: "22%",
            display: "none",
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
              className="js-trail-img absolute inset-0 h-full w-full rounded-[15%] object-cover"
              style={{ display: "none" }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}`

export const slinkyTrailFile = {
  "slinky-trail.tsx": {
    code: slinkyTrailString,
    language: "tsx",
  },
}
