"use client"

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
  /** How many items should be visible on screen at this breakpoint */
  visibleItems?: number
  /** The maximum height (in pixels) of the center, focused item */
  maxHeight?: number
  /** The minimum height (in pixels) of the outer, unfocused items */
  minHeight?: number
}

export interface ConvexCarouselProps {
  /** Array of image objects to display. Automatically duplicated to ensure an infinite loop. */
  items: ConvexCarouselItem[]
  /** Mobile-first default for visible items. @default 7 */
  visibleItems?: number
  /** Mobile-first default for the center item's max height in pixels. @default 450 */
  maxHeight?: number
  /** Mobile-first default for the outer items' min height in pixels. @default 120 */
  minHeight?: number
  /** Tailwind-style min-width breakpoints for responsive sizing. e.g., { 640: { visibleItems: 5 } } */
  breakpoints?: Record<number, CarouselBreakpoint>
  /** Whether the carousel should move automatically. @default false */
  autoMove?: boolean
  /** The type of auto-movement. "continuous" drifts smoothly, "step" snaps to items. @default "continuous" */
  autoMoveType?: "continuous" | "step"
  /** The velocity of the continuous auto-scroll. @default 0.01 */
  autoMoveSpeed?: number
  /** The delay (in ms) between steps if autoMoveType is "step". @default 3000 */
  stepInterval?: number
  /** The duration (in seconds) of the snapping animation if autoMoveType is "step". @default 1 */
  stepDuration?: number
  /** How aggressively the carousel responds to mouse/wheel drag velocity. @default 0.005 */
  scrollMultiplier?: number
  /** The physics friction applied to the drag momentum. Lower = slides longer. @default 0.95 */
  friction?: number
  className?: string
}

/**
 * ConvexCarousel
 *
 * A high-performance, physics-based infinite carousel for Satis UI.
 * Items mathematically scale based on an inverted parabola, creating a 3D "convex"
 * lens bulging visual effect using strictly 2D DOM manipulation for maximum FPS.
 */
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

  // Mathematical State Trackers (Bypassing React State for 60fps performance)
  const scrollXRef = React.useRef(0)
  const velocityRef = React.useRef(0)

  // 1. Calculate the MAX items needed across all breakpoints so React only mounts DOM nodes ONCE
  const maxRequiredVisible = React.useMemo(() => {
    let max = visibleItems
    if (breakpoints) {
      Object.values(breakpoints).forEach((bp) => {
        if (bp.visibleItems && bp.visibleItems > max) max = bp.visibleItems
      })
    }
    return max
  }, [visibleItems, breakpoints])

  // 2. Clone array heavily to guarantee enough nodes for an unbroken infinite loop
  const extendedItems = React.useMemo(() => {
    const minRequired = maxRequiredVisible * 3
    let duplicated: ConvexCarouselItem[] = [...items]
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

      // WCAG Safety: Detects motion sensitivity and aggressively disables infinite auto-scrolling
      mm.add("(prefers-reduced-motion: reduce)", () => {
        isReducedMotion = true
      })

      // 3. Mutable variables controlled entirely by GSAP on resize
      let activeVis = visibleItems
      let activeMaxH = maxHeight
      let activeMinH = minHeight
      let activeMinScale = activeMinH / activeMaxH
      let windowWidth = window.innerWidth
      let maxWidth = 0

      // 4. The morphing function: Applies CSS-like min-width breakpoints purely in JS
      const updateConfig = () => {
        windowWidth = window.innerWidth

        // Safety lock: Prevent elements from ever breaking out of their container's height boundary
        const containerHeight =
          containerRef.current?.clientHeight || window.innerHeight

        activeVis = visibleItems
        let configuredMaxH = maxHeight
        let configuredMinH = minHeight

        if (breakpoints) {
          // Sort ascending (mobile-first logic)
          const bps = Object.keys(breakpoints)
            .map(Number)
            .sort((a, b) => a - b)
          for (const bp of bps) {
            if (windowWidth >= bp) {
              if (breakpoints[bp].visibleItems)
                activeVis = breakpoints[bp].visibleItems
              if (breakpoints[bp].maxHeight)
                configuredMaxH = breakpoints[bp].maxHeight
              if (breakpoints[bp].minHeight)
                configuredMinH = breakpoints[bp].minHeight
            }
          }
        }

        // Clamp the max height so it never clips out of the container
        activeMaxH = Math.min(configuredMaxH, containerHeight)
        // Ensure minHeight is strictly smaller than maxHeight to prevent rendering bugs
        activeMinH = Math.min(configuredMinH, activeMaxH * 0.8)
        activeMinScale = activeMinH / activeMaxH

        // Specific Math for the Convex curve area calculation
        const integralAvgScale = activeMinScale + (1 - activeMinScale) * (2 / 3)
        maxWidth = windowWidth / (activeVis * integralAvgScale)
      }

      const onResize = () => updateConfig()
      window.addEventListener("resize", onResize)
      onResize() // Trigger layout generation on initial load

      // Step Animation Trackers
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

      // Touch/Drag/Scroll Observer Physics
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
          // Normalizes touch drag distance perfectly
          velocityRef.current -= e.deltaX * scrollMultiplier
        },
        onRelease: () => scheduleNextStep(),
      })

      const totalItems = extendedItems.length

      // The Core Render Engine (Executes on every GSAP tick at 60/120fps)
      const update = () => {
        velocityRef.current *= friction

        // Culling to completely kill microscopic drift
        if (Math.abs(velocityRef.current) < 0.0001) velocityRef.current = 0

        let velocity = velocityRef.current

        // Injects continuous momentum unless motion is reduced via OS settings
        if (!isReducedMotion && autoMove && autoMoveType === "continuous") {
          velocity += autoMoveSpeed
        }

        scrollXRef.current += velocity

        // Perfect modulo wrapping for flawless infinite looping
        scrollXRef.current =
          ((scrollXRef.current % totalItems) + totalItems) % totalItems

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

          // THE MAGIC: Convex Math (Inverted Parabola)
          const scale =
            activeMinScale +
            (1 - activeMinScale) * (1 - normalizedD * normalizedD)

          layoutData[i] = { scale, width: maxWidth * scale, x: 0 }
        }

        const centerScreenX = windowWidth / 2

        layoutData[leftIdx].x =
          centerScreenX -
          frac *
            (layoutData[leftIdx].width / 2 + layoutData[rightIdx].width / 2)

        layoutData[rightIdx].x =
          layoutData[leftIdx].x +
          layoutData[leftIdx].width / 2 +
          layoutData[rightIdx].width / 2

        let currR = rightIdx
        for (let step = 1; step <= Math.floor(totalItems / 2); step++) {
          const next = (currR + 1) % totalItems
          layoutData[next].x =
            layoutData[currR].x +
            layoutData[currR].width / 2 +
            layoutData[next].width / 2
          currR = next
        }

        let currL = leftIdx
        for (let step = 1; step <= Math.floor(totalItems / 2); step++) {
          const prev = (currL - 1 + totalItems) % totalItems
          layoutData[prev].x =
            layoutData[currL].x -
            layoutData[currL].width / 2 -
            layoutData[prev].width / 2
          currL = prev
        }

        // Blast the coordinates into the DOM securely
        itemsRef.current.forEach((el, i) => {
          if (!el) return
          const data = layoutData[i]
          const isOffScreen =
            data.x < -maxWidth * 2 || data.x > windowWidth + maxWidth * 2

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

      update() // Force initial paint
      gsap.to(wrapperRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      }) // Prevent FOUC
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
