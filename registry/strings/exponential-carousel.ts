export const exponentialCarouselDemoString = `
import { ExponentialCarousel } from "@/components/ui/exponential-carousel"

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

export default function ExponentialCarouselDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mt-4 max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Grab, swipe, or scroll.
        </p>
      </section>

      <section className="relative h-[45vh] w-full md:h-[55vh]">
        <ExponentialCarousel
          items={IMAGES}
          exponent={4} 
          visibleItems={6}
          maxHeight={300}
          minHeight={40} 
          breakpoints={{
            640: { visibleItems: 8, maxHeight: 400, minHeight: 50 },
            1024: { visibleItems: 10, maxHeight: 500, minHeight: 60 },
            1280: { visibleItems: 12, maxHeight: 600, minHeight: 20 },
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

export const exponentialCarouselString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

export interface ExponentialCarouselItem {
  id: string
  url: string
  alt?: string
}

export interface CarouselBreakpoint {
  visibleItems?: number
  maxHeight?: number
  minHeight?: number
}

export interface ExponentialCarouselProps {
  items: ExponentialCarouselItem[]
  visibleItems?: number
  exponent?: number 
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

export function ExponentialCarousel({
  items,
  visibleItems = 10,
  exponent = 4,
  maxHeight = 600,
  minHeight = 60,
  breakpoints,
  autoMove = false,
  autoMoveType = "continuous",
  autoMoveSpeed = 0.005,
  stepInterval = 3000,
  stepDuration = 1,
  scrollMultiplier = 0.005,
  friction = 0.95,
  className,
}: ExponentialCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const itemsRef = React.useRef<(HTMLDivElement | null)[]>([])
  
  const progressRef = React.useRef(0)
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
    const minRequired = maxRequiredVisible * 4
    let duplicated: ExponentialCarouselItem[] = [...items]
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
        activeMinH = Math.min(configuredMinH, activeMaxH * 0.2) 
        activeMinScale = activeMinH / activeMaxH
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
            const currentP = progressRef.current
            const stepSign = autoMoveSpeed >= 0 ? -1 : 1
            const targetP = Math.round(currentP) + stepSign
            const dist = targetP - currentP

            let lastProxy = 0
            const proxy = { x: 0 }

            stepTween = gsap.to(proxy, {
              x: dist,
              duration: stepDuration,
              ease: "power2.inOut",
              onUpdate: () => {
                const delta = proxy.x - lastProxy
                progressRef.current += delta
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
          velocityRef.current -= e.deltaY * scrollMultiplier
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
          velocity -= autoMoveSpeed
        }

        progressRef.current += velocity
        const progress = ((progressRef.current % totalItems) + totalItems) % totalItems
        
        const shiftOffset = Math.floor((totalItems - activeVis) / 2)

        const A = activeMinScale
        const V = activeVis
        const n = exponent

        const C = (u: number) => {
          if (u < 0) return A * u
          return A * u + ((1 - A) * Math.pow(u, n + 1)) / (Math.pow(V, n) * (n + 1))
        }

        const peakScale = C(V) - C(V - 1)
        const baseHeight = activeMaxH / peakScale
        const W_max_base = windowWidth / C(V)

        itemsRef.current.forEach((el, i) => {
          if (!el) return

          let u = (((i - progress) % totalItems) + totalItems) % totalItems
          
          if (u > activeVis + shiftOffset) u -= totalItems

          const x_left = W_max_base * C(u)
          const x_right = W_max_base * C(u + 1)

          const renderedWidth = x_right - x_left
          const scale = renderedWidth / W_max_base
          const x_center = (x_left + x_right) / 2

          const isOffScreen = x_right < -W_max_base || x_left > windowWidth + W_max_base

          gsap.set(el, {
            x: x_center - W_max_base / 2,
            scale: scale,
            width: W_max_base,
            height: baseHeight, 
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
        exponent, 
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

export const exponentialCarouselFile = {
  "exponential-carousel.tsx": {
    code: exponentialCarouselString,
    language: "tsx",
  },
}
