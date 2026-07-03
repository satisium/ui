"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export interface SlinkyTrailProps {
  /** Array of image URLs to render. */
  imageUrls?: string[]
  /** Total number of cards in the continuous chain. @default 12 */
  maxItems?: number
  /** The base pixel size of the image cards. @default 110 */
  itemSize?: number
  /** How tight the spring is. Lower = looser/longer snake, Higher = tighter/shorter snake (0.1 to 0.9). @default 0.3 */
  stiffness?: number
  /** Standard Tailwind classes for the fixed wrapper. */
  className?: string
  /** Standard Tailwind classes applied to the individual image wrappers. */
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

  // This trail uses a persistent fixed-length chain, no object pooling needed
  const nodes = useRef<NodeData[]>(
    Array.from({ length: maxItems }, (_, i) => ({
      x: -1000,
      y: -1000,
      vx: 0,
      vy: 0,
      rx: 0,
      // Assign a slight alternating resting rotation so the stack looks "messy" when stopped
      baseRot: i % 2 === 0 ? i * 2.5 : -i * 2.5,
      imageIndex: i, // Will be safely modulo mapped during render
    }))
  )

  const domRefs = useRef<(HTMLDivElement | null)[]>([])

  const mouse = useRef({
    x: -1000,
    y: -1000,
    moved: false,
  })

  // Mutable config allows on-the-fly physics updates without restarting loops
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

      // If this is the first movement, instantly warp all nodes to the pointer
      // to prevent them from visibly flying in from the top left corner (0,0)
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

    // Unified pointer events for touch & mouse compatibility
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

          // Node 0 chases the mouse. Node N chases Node N-1.
          const targetX = i === 0 ? mouse.current.x : nodes.current[i - 1].x
          const targetY = i === 0 ? mouse.current.y : nodes.current[i - 1].y

          // Calculate spring velocity (lerp)
          node.vx = (targetX - node.x) * c.stiffness
          node.vy = (targetY - node.y) * c.stiffness

          node.x += node.vx
          node.y += node.vy

          // Add some dynamic rotational tilt based on horizontal velocity (X movement)
          const targetRot = node.vx * 1.5
          // Lerp the rotation to smooth out the flipping
          node.rx += (targetRot + node.baseRot - node.rx) * 0.2

          // Make the tail slightly smaller than the head to emphasize depth
          const scale = 1 - (i / c.maxItems) * 0.25

          domNode.style.display = "flex"
          // Reverse Z-Index so the head of the snake is always on top
          domNode.style.zIndex = (c.maxItems - i).toString()

          domNode.style.transform = `
            translate3d(${node.x}px, ${node.y}px, 0) 
            rotate(${node.rx}deg) 
            scale(${scale})
          `

          // Ensure the node picks a valid image index
          const safeImageIndex = node.imageIndex % c.imageUrls.length

          const imagesInside =
            domNode.querySelectorAll<HTMLImageElement>("img.js-trail-img")
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

  // Preload images safely avoiding CORS/Hotlink cache collisions
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
            width: `${itemSize}px`,
            height: `${itemSize}px`,
            marginLeft: `-${itemSize / 2}px`,
            marginTop: `-${itemSize / 2}px`,
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
}
