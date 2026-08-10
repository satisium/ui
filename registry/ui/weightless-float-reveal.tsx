"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface WeightlessFloatRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** Minimum starting Y offset (pixels). @default 40 */
  startYMin?: number
  /** Maximum starting Y offset (pixels). @default 80 */
  startYMax?: number
  /** Minimum starting rotation (degrees). @default -8 */
  startRotationMin?: number
  /** Maximum starting rotation (degrees). @default 8 */
  startRotationMax?: number
  /** Long durations (2s+) are key to the anti-gravity feel. @default 2.5 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Slower stagger gives a more ambient, fluid read. @default 0.06 */
  stagger?: number
  /** GSAP easing function. @default "power3.out" */
  ease?: string
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * WeightlessFloatReveal
 *
 * An ambient, zero-gravity text reveal component for Satisium UI.
 * Elements drift upwards into place from randomized depths and rotations,
 * creating an organic, weightless floating effect.
 *
 * @example
 * ```tsx
 * import { WeightlessFloatReveal } from "@/components/ui/weightless-float-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <WeightlessFloatReveal
 *       as="h1"
 *       text="Defying gravity."
 *       splitBy="char"
 *       startYMin={30}
 *       startYMax={100}
 *     />
 *   )
 * }
 * ```
 */
export const WeightlessFloatReveal = React.forwardRef<
  HTMLElement,
  WeightlessFloatRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startYMin = 40,
      startYMax = 80,
      startRotationMin = -8,
      startRotationMax = 8,
      duration = 2.5,
      delay = 0,
      stagger = 0.06,
      ease = "power3.out",
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to securely bypass React polymorphic type constraints
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".weightless-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // fromTo is used to safely inject randomized starting values strictly on the client,
          // preventing React hydration errors from mismatched server/client math.
          gsap.fromTo(
            elements,
            {
              y: () => gsap.utils.random(startYMin, startYMax),
              rotation: () =>
                gsap.utils.random(startRotationMin, startRotationMax),
              opacity: 0,
            },
            {
              y: 0,
              rotation: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              // power3.out decelerates smoothly and endlessly, mimicking a frictionless environment
              ease,
              force3D: true,
              clearProps: "transform,opacity", // Restores native rendering upon completion
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
                once: viewportOnce,
                toggleActions: viewportOnce
                  ? "play none none none"
                  : "play none none reverse",
              },
            }
          )
        })

        // Accessibility Failsafe for Vestibular Disorders
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              delay,
              stagger,
              ease: "none",
              clearProps: "transform",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
                once: viewportOnce,
                toggleActions: viewportOnce
                  ? "play none none none"
                  : "play none none reverse",
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [
          text,
          startYMin,
          startYMax,
          startRotationMin,
          startRotationMax,
          duration,
          delay,
          stagger,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0, // Hidden on server to prevent FOUC before randomized offsets are generated
      willChange: "transform, opacity",
      display: "inline-block", // Required for physics to apply
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader safe
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
              return (
                <span key={wordIndex} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            if (splitBy === "char") {
              return (
                <span key={wordIndex} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, charIndex) => (
                    <span
                      key={`${wordIndex}-${charIndex}`}
                      className="weightless-item"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={wordIndex}
                className="weightless-item"
                style={ssrInitialStyles}
              >
                {word}
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

WeightlessFloatReveal.displayName = "WeightlessFloatReveal"
