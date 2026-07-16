export const convexCarouselDemoString = `
import { ConvexCarousel } from "@/components/ui/convex-carousel"

const IMAGES = [
  {
    id: "1",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1782906341/ui-v3/demos/images/12.jpg",
  },
  {
    id: "2",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/13.jpg",
  },
  {
    id: "3",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/14.jpg",
  },
  {
    id: "4",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/15.jpg",
  },
  {
    id: "5",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/9.jpg",
  },
  {
    id: "6",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/17.jpg",
  },
  {
    id: "7",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/18.jpg",
  },
  {
    id: "8",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/19.jpg",
  },
  {
    id: "9",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/20.jpg",
  },
  {
    id: "10",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/21.jpg",
  },
  {
    id: "11",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/22.jpg",
  },
  {
    id: "12",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/24.jpg",
  },
  {
    id: "13",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/25.jpg",
  },
  {
    id: "14",
    url: "https://res.cloudinary.com/ddon6aux0/image/upload/v1780746659/ui-v3/demos/images/26.jpg",
  },
]

export default function ConvexCarouselDemo() {
  return (
    <main className="flex h-screen w-full flex-col bg-background text-foreground">
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mt-4 max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Grab, swipe, or scroll .
        </p>
      </section>

      <section className="relative h-[45vh] w-full lg:h-[60vh]">
        <ConvexCarousel
          items={IMAGES}
          visibleItems={5}
          maxHeight={300}
          minHeight={80}
          breakpoints={{
            640: { visibleItems: 5, maxHeight: 400, minHeight: 100 },
            1024: { visibleItems: 5, maxHeight: 500, minHeight: 120 },
            1280: { visibleItems: 7, maxHeight: 600, minHeight: 150 },
          }}
          autoMove={true}
          autoMoveType="continuous"
          autoMoveSpeed={0.005} 
          scrollMultiplier={0.0002}
        />
      </section>
    </main>
  )
}
`

export const convexCarouselString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

export interface ConvexCarouselItem {
  id: string
  url: string
  alt?: string
}

export interface CarouselBreakpoint {
  visibleItems?: number
  maxHeight?: number
  minHeight?: number
}

export interface ConvexCarouselProps {
  items: ConvexCarouselItem[]
  visibleItems?: number
  maxHeight?: number
  minHeight?: number
  breakpoints?: Record<number, CarouselBreakpoint>
  autoMove?: boolean
  autoMoveType?: "continuous" | "step"
  autoMoveSpeed?: number
  stepInterval?: number
  stepDuration?: number
  scrollMultiplier?: number
  friction?: number
  className?: string
}

export function ConvexCarousel({
  items,
  visibleItems = 7,
  maxHeight = 450,
  minHeight = 120,
  breakpoints,
  autoMove = false,
  autoMoveType = "continuous",
  autoMoveSpeed = 0.01,
  stepInterval = 3000,
  stepDuration = 1,
  scrollMultiplier = 0.005,
  friction = 0.95,
  className,
}: ConvexCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([])
  
  const scrollXRef = React.useRef(0)
  const velocityRef = React.useRef(0)

  const maxRequiredVisible = React.useMemo(() => {
    let max = visibleItems
    if (breakpoints) {
      Object.values(breakpoints).forEach((bp) => {
        if (bp.visibleItems && bp.visibleItems > max) max = bp.visibleItems
      })
    }
    return max
  }, [visibleItems, breakpoints])

  const extendedItems = React.useMemo(() => {
    const minRequired = maxRequiredVisible * 3
    let duplicated: ConvexCarouselItem[] = [...items]
    while (duplicated.length < minRequired) {
      duplicated = [...duplicated, ...items]
    }
    return duplicated.map((item, i) => ({
      ...item,
      _uniqueId: \`\${item.id}-\${i}\`,
    }))
  }, [items, maxRequiredVisible])

  useGSAP(
    () => {
      if (!containerRef.current || itemsRef.current.length === 0) return

      const mm = gsap.matchMedia()
      let isReducedMotion = false

      mm.add("(prefers-reduced-motion: reduce)", () => {
        isReducedMotion = true
      })

      let activeVis = visibleItems
      let activeMaxH = maxHeight
      let activeMinH = minHeight
      let activeMinScale = activeMinH / activeMaxH
      let windowWidth = window.innerWidth
      let maxWidth = 0

      const updateConfig = () => {
        windowWidth = window.innerWidth
        
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight

        activeVis = visibleItems
        let configuredMaxH = maxHeight
        let configuredMinH = minHeight

        if (breakpoints) {
          const bps = Object.keys(breakpoints).map(Number).sort((a, b) => a - b)
          for (const bp of bps) {
            if (windowWidth >= bp) {
              if (breakpoints[bp].visibleItems) activeVis = breakpoints[bp].visibleItems
              if (breakpoints[bp].maxHeight) configuredMaxH = breakpoints[bp].maxHeight
              if (breakpoints[bp].minHeight) configuredMinH = breakpoints[bp].minHeight
            }
          }
        }

        activeMaxH = Math.min(configuredMaxH, containerHeight)
        activeMinH = Math.min(configuredMinH, activeMaxH * 0.8)
        activeMinScale = activeMinH / activeMaxH

        const integralAvgScale = activeMinScale + (1 - activeMinScale) * (2 / 3)
        maxWidth = windowWidth / (activeVis * integralAvgScale)
      }

      const onResize = () => updateConfig()
      window.addEventListener("resize", onResize)
      onResize() 

      let stepTween: gsap.core.Tween | null = null
      let stepTimer: gsap.core.Tween | null = null

      const scheduleNextStep = () => {
        if (stepTimer) stepTimer.kill()
        if (stepTween) stepTween.kill()

        if (isReducedMotion) return

        if (autoMove && autoMoveType === "step") {
          stepTimer = gsap.delayedCall(stepInterval / 1000, () => {
            const currentX = scrollXRef.current
            const stepSign = autoMoveSpeed >= 0 ? 1 : -1
            const targetX = Math.round(currentX) + stepSign
            const dist = targetX - currentX

            let lastProxy = 0
            const proxy = { x: 0 }

            stepTween = gsap.to(proxy, {
              x: dist,
              duration: stepDuration,
              ease: "power2.inOut",
              onUpdate: () => {
                const delta = proxy.x - lastProxy
                scrollXRef.current += delta
                lastProxy = proxy.x
                velocityRef.current = 0
              },
              onComplete: scheduleNextStep,
            })
          })
        }
      }

      scheduleNextStep()

      const observer = Observer.create({
        target: containerRef.current,
        type: "wheel,touch,pointer",
        onPress: () => {
          if (stepTween) stepTween.kill()
          if (stepTimer) stepTimer.kill()
        },
        onWheel: (e) => {
          if (stepTween) stepTween.kill()
          velocityRef.current += e.deltaY * scrollMultiplier
          scheduleNextStep()
        },
        onDrag: (e) => {
          velocityRef.current -= e.deltaX * scrollMultiplier
        },
        onRelease: () => scheduleNextStep(),
      })

      const totalItems = extendedItems.length

      const update = () => {
        velocityRef.current *= friction
        
        if (Math.abs(velocityRef.current) < 0.0001) velocityRef.current = 0

        let velocity = velocityRef.current

        if (!isReducedMotion && autoMove && autoMoveType === "continuous") {
          velocity += autoMoveSpeed
        }

        scrollXRef.current += velocity
        scrollXRef.current = ((scrollXRef.current % totalItems) + totalItems) % totalItems

        const scrollX = scrollXRef.current
        const leftIdx = Math.floor(scrollX)
        const rightIdx = (leftIdx + 1) % totalItems
        const frac = scrollX - leftIdx

        const layoutData = new Array(totalItems).fill({
          scale: 1,
          width: maxWidth,
          x: 0,
        })

        for (let i = 0; i < totalItems; i++) {
          const d1 = Math.abs(i - scrollX)
          const d2 = Math.abs(i - (scrollX - totalItems))
          const d3 = Math.abs(i - (scrollX + totalItems))
          const dist = Math.min(d1, d2, d3)

          const normalizedD = Math.min(dist / (activeVis / 2), 1)
          
          const scale = activeMinScale + (1 - activeMinScale) * (1 - normalizedD * normalizedD)

          layoutData[i] = { scale, width: maxWidth * scale, x: 0 }
        }

        const centerScreenX = windowWidth / 2

        layoutData[leftIdx].x =
          centerScreenX - frac * (layoutData[leftIdx].width / 2 + layoutData[rightIdx].width / 2)

        layoutData[rightIdx].x =
          layoutData[leftIdx].x + layoutData[leftIdx].width / 2 + layoutData[rightIdx].width / 2

        let currR = rightIdx
        for (let step = 1; step <= Math.floor(totalItems / 2); step++) {
          const next = (currR + 1) % totalItems
          layoutData[next].x = layoutData[currR].x + layoutData[currR].width / 2 + layoutData[next].width / 2
          currR = next
        }

        let currL = leftIdx
        for (let step = 1; step <= Math.floor(totalItems / 2); step++) {
          const prev = (currL - 1 + totalItems) % totalItems
          layoutData[prev].x = layoutData[currL].x - layoutData[currL].width / 2 - layoutData[prev].width / 2
          currL = prev
        }

        itemsRef.current.forEach((el, i) => {
          if (!el) return
          const data = layoutData[i]
          const isOffScreen = data.x < -maxWidth * 2 || data.x > windowWidth + maxWidth * 2

          gsap.set(el, {
            x: data.x - maxWidth / 2,
            scale: data.scale,
            width: maxWidth,
            height: activeMaxH,
            transformOrigin: "bottom center",
            autoAlpha: isOffScreen ? 0 : 1,
            force3D: true,
          })
        })
      }

      update() 
      gsap.to(wrapperRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" }) 
      gsap.ticker.add(update)

      return () => {
        window.removeEventListener("resize", onResize)
        gsap.ticker.remove(update)
        observer.kill()
        if (stepTween) stepTween.kill()
        if (stepTimer) stepTimer.kill()
      }
    },
    {
      scope: containerRef,
      dependencies: [
        extendedItems,
        visibleItems,
        breakpoints,
        autoMove,
        autoMoveType,
        autoMoveSpeed,
        stepInterval,
        stepDuration,
        scrollMultiplier,
        friction,
        maxHeight,
        minHeight,
      ],
    }
  )

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-live="polite"
      className={cn(
        "relative h-full w-full cursor-grab touch-none overflow-hidden bg-transparent select-none active:cursor-grabbing",
        className
      )}
    >
      <div
        ref={wrapperRef}
        className="absolute inset-0 flex h-full w-full items-end opacity-0"
      >
        {extendedItems.map((item, index) => (
          <div
            key={item._uniqueId}
            ref={(el) => {
              itemsRef.current[index] = el
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={\`Slide \${index + 1} of \${extendedItems.length}\`}
            className="absolute bottom-0 flex items-end justify-center overflow-hidden will-change-transform"
            style={{ transformOrigin: "bottom center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt || \`Item \${index}\`}
              draggable={false}
              className="pointer-events-none h-full w-full object-cover select-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
`

export const convexCarouselFile = {
  "convex-carousel.tsx": {
    code: convexCarouselString,
    language: "tsx",
  },
}
