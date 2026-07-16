"use client"

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
  /** How many items should be visible on screen at this breakpoint */
  visibleItems?: number
  /** The maximum height (in pixels) of the largest, foreground item */
  maxHeight?: number
  /** The minimum height (in pixels) of the smallest, background items */
  minHeight?: number
}

export interface ExponentialCarouselProps {
  /** Array of image objects to display. Automatically duplicated to ensure an infinite loop. */
  items: ExponentialCarouselItem[]
  /** Mobile-first default for visible items. @default 10 */
  visibleItems?: number
  /** The intensity of the curve. 1 = Linear, 2 = Quadratic, 3 = Cubic, 4 = Sharp Hockey Stick. @default 4 */
  exponent?: number
  /** Mobile-first default for the peak item's max height in pixels. @default 600 */
  maxHeight?: number
  /** Mobile-first default for the tail items' min height in pixels. @default 60 */
  minHeight?: number
  /** Tailwind-style min-width breakpoints for responsive sizing. e.g., { 640: { visibleItems: 8 } } */
  breakpoints?: Record<number, CarouselBreakpoint>
  /** Whether the carousel should move automatically. @default false */
  autoMove?: boolean
  /** The type of auto-movement. "continuous" drifts smoothly, "step" snaps to items. @default "continuous" */
  autoMoveType?: "continuous" | "step"
  /** The velocity of the continuous auto-scroll. @default 0.005 */
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
 * ExponentialCarousel
 *
 * A high-performance, mathematics-driven infinite carousel for Satis UI.
 * Uses integration calculus to perfectly pack items side-by-side along an
 * exponential curve, creating a dramatic "hockey stick" perspective.
 */
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

  // Mathematical State Trackers (Bypassing React State for 60fps performance)
  const progressRef = React.useRef(0)
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
    const minRequired = maxRequiredVisible * 4
    let duplicated: ExponentialCarouselItem[] = [...items]
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
          // Sort ascending (mobile-first logic like Tailwind)
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

        activeMaxH = Math.min(configuredMaxH, containerHeight)
        // Force the tail to be small for max visual contrast (exponent curve)
        activeMinH = Math.min(configuredMinH, activeMaxH * 0.2)
        activeMinScale = activeMinH / activeMaxH
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
          velocityRef.current -= e.deltaY * scrollMultiplier
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
          velocity -= autoMoveSpeed
        }

        progressRef.current += velocity

        // Perfect modulo wrapping for flawless infinite looping
        const progress =
          ((progressRef.current % totalItems) + totalItems) % totalItems

        const shiftOffset = Math.floor((totalItems - activeVis) / 2)

        const A = activeMinScale
        const V = activeVis
        const n = exponent

        // THE INTEGRAL: Mathematically flawless side-by-side packing for a power curve
        const C = (u: number) => {
          if (u < 0) return A * u
          return (
            A * u + ((1 - A) * Math.pow(u, n + 1)) / (Math.pow(V, n) * (n + 1))
          )
        }

        // Height Normalization: Ensure the largest visible item precisely strikes `activeMaxH`
        const peakScale = C(V) - C(V - 1)
        const baseHeight = activeMaxH / peakScale
        const W_max_base = windowWidth / C(V)

        // Blast the coordinates into the DOM securely
        itemsRef.current.forEach((el, i) => {
          if (!el) return

          let u = (((i - progress) % totalItems) + totalItems) % totalItems

          // Requeue items that fall off the screen back to the start of the loop
          if (u > activeVis + shiftOffset) u -= totalItems

          const x_left = W_max_base * C(u)
          const x_right = W_max_base * C(u + 1)

          const renderedWidth = x_right - x_left
          const scale = renderedWidth / W_max_base
          const x_center = (x_left + x_right) / 2

          const isOffScreen =
            x_right < -W_max_base || x_left > windowWidth + W_max_base

          gsap.set(el, {
            x: x_center - W_max_base / 2,
            scale: scale,
            width: W_max_base,
            height: baseHeight, // Normalized base height applies the ceiling fix
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
        exponent, // Re-runs layout setup safely if curve math changes
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
