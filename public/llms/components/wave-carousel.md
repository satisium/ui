# Wave Carousel Component Context

**Description:** A high-performance, sine-wave driven infinite carousel for Satis UI. Items mathematically scale up and down based on a cosine wave, creating a "rolling hills" visual effect using strictly 2D DOM manipulation for maximum FPS. Integrates a GSAP ticker loop and GSAP Observer for flawless touch, drag, and wheel physics. Includes robust GC cleanup and reduced-motion vestibular failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/wave-carousel.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop               | Type                         | Default        | Description                                                   |
| :----------------- | :--------------------------- | :------------- | :------------------------------------------------------------ |
| `items`            | `WaveCarouselItem[]`         | _Required_     | Image array (`{ id, url, alt }`).                             |
| `visibleItems`     | `number`                     | `9`            | Base visible items.                                           |
| `waves`            | `number`                     | `2`            | Number of repeating sine waves on screen.                     |
| `maxHeight`        | `number`                     | `400`          | Peak height (px).                                             |
| `minHeight`        | `number`                     | `150`          | Valley height (px).                                           |
| `breakpoints`      | `Record<number, Breakpoint>` | `undefined`    | Mobile-first overrides (e.g. `{ 640: { visibleItems: 5 } }`). |
| `autoMove`         | `boolean`                    | `false`        | Enable autoplay.                                              |
| `autoMoveType`     | `"continuous" \| "step"`     | `"continuous"` | Autoplay behavior mode.                                       |
| `autoMoveSpeed`    | `number`                     | `0.01`         | Continuous drift velocity.                                    |
| `stepInterval`     | `number`                     | `3000`         | Delay between step snaps (ms).                                |
| `stepDuration`     | `number`                     | `1`            | Step snap duration (s).                                       |
| `scrollMultiplier` | `number`                     | `0.005`        | Drag sensitivity multiplier.                                  |
| `friction`         | `number`                     | `0.95`         | Momentum friction decay.                                      |

## 3. Core Component Source

**File Path:** `registry/ui/wave-carousel.tsx`

```tsx
"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Observer } from "gsap/Observer"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer)
}

export interface WaveCarouselItem {
  id: string
  url: string
  alt?: string
}

export interface CarouselBreakpoint {
  visibleItems?: number
  maxHeight?: number
  minHeight?: number
}

export interface WaveCarouselProps {
  items: WaveCarouselItem[]
  visibleItems?: number
  waves?: number
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

export function WaveCarousel({
  items,
  visibleItems = 9,
  waves = 2,
  maxHeight = 400,
  minHeight = 150,
  breakpoints,
  autoMove = false,
  autoMoveType = "continuous",
  autoMoveSpeed = 0.01,
  stepInterval = 3000,
  stepDuration = 1,
  scrollMultiplier = 0.005,
  friction = 0.95,
  className,
}: WaveCarouselProps) {
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
    let duplicated: WaveCarouselItem[] = [...items]
    while (duplicated.length < minRequired) {
      duplicated = [...duplicated, ...items]
    }
    return duplicated.map((item, i) => ({
      ...item,
      _uniqueId: `${item.id}-${i}`,
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

        const integralAvgScale = activeMinScale + (1 - activeMinScale) * 0.5
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
            const targetX = Math.round(currentX) + 1
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
          const d1 = i - scrollX
          const d2 = i - (scrollX - totalItems)
          const d3 = i - (scrollX + totalItems)
          let dist = d1
          if (Math.abs(d2) < Math.abs(dist)) dist = d2
          if (Math.abs(d3) < Math.abs(dist)) dist = d3

          const normalizedD = dist / activeVis

          const waveMultiplier = (Math.cos(normalizedD * Math.PI * 2 * waves) + 1) / 2
          const scale = activeMinScale + (1 - activeMinScale) * waveMultiplier

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
        waves,
        autoMove,
        autoMoveType,
        autoMoveSpeed,
        stepInterval,
        stepDuration,
        scrollMultiplier,
        friction,
        maxHeight,
        minHeight,
        breakpoints,
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
            aria-label={`Slide ${index + 1} of ${extendedItems.length}`}
            className="absolute bottom-0 flex items-end justify-center overflow-hidden will-change-transform"
            style={{ transformOrigin: "bottom center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt || `Item ${index}`}
              draggable={false}
              className="pointer-events-none h-full w-full object-cover select-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { WaveCarousel } from "@/registry/ui/wave-carousel"

export default function ExamplePage() {
  return (
    <main className="flex h-screen w-full flex-col">
      <section className="relative h-[55vh] w-full">
        <WaveCarousel
          items={[{ id: "1", url: "/placeholder.jpg" }]}
          waves={1.5}
          visibleItems={5}
          autoMove={true}
          autoMoveSpeed={0.005}
        />
      </section>
    </main>
  )
}
```
