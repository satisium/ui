"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface VelocityBrakeRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The full string of text to reveal. Supports newlines and formatting. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** The starting horizontal offset. @default "-3em" (Sliding from the left) */
  startX?: string | number
  /** The starting backward tilt (wind resistance). @default -25 */
  startSkew?: number
  /** The duration of the slide and snap. @default 0.9 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Stagger delay between each element decelerating. @default 0.04 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * VelocityBrakeReveal
 *
 * A kinetic text reveal component for Satisium UI.
 * Elements slide in rapidly from an offset and slam on the brakes, whipping forward
 * into a heavy skew overshoot before settling perfectly into place.
 *
 * @example
 * ```tsx
 * import { VelocityBrakeReveal } from "@/components/satisium-ui/velocity-brake-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <VelocityBrakeReveal
 *       as="h1"
 *       text="Momentum & Friction."
 *       splitBy="char"
 *       startSkew={-30}
 *     />
 *   )
 * }
 * ```
 */
export const VelocityBrakeReveal = React.forwardRef<
  HTMLElement,
  VelocityBrakeRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startX = "-3em",
      startSkew = -25,
      duration = 0.9,
      delay = 0,
      stagger = 0.04,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints safely
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".brake-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: startX,
              skewX: startSkew,
              opacity: 0,
            },
            {
              x: 0,
              skewX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              // The Physics Engine: back.out(2.5) forces the value to heavily overshoot 0.
              ease: "back.out(2.5)",
              force3D: true, // Hardware accelerates to prevent vector jitter
              clearProps: "transform,opacity", // Strips inline styles when done for native rendering
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

        // Accessibility Failsafe for Vestibular Disorders (Simple fade-in)
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
              clearProps: "transform", // Resets the SSR transforms
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
          startX,
          startSkew,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // FOUC FIX: Push the elements out of view directly in the SSR HTML payload
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateX(${startX}) skewX(${startSkew}deg)`,
      // THE ANCHOR: The bottom of the letter acts as the brakes.
      // The top of the letter is the heavy mass that whips forward.
      transformOrigin: "bottom center",
      willChange: "transform, opacity",
      display: "inline-block",
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
        style={{ padding: "0.2em 0" }} // Retained padding to prevent clipping of tall letters
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
                      className="brake-item"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              )
            }

            // Default: Split by Word
            return (
              <span
                key={wordIndex}
                className="brake-item"
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

VelocityBrakeReveal.displayName = "VelocityBrakeReveal"
