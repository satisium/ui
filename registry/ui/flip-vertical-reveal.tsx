"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FlipVerticalRevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The text to reveal.
   */
  text: string
  /**
   * The HTML tag to render as.
   * @default "h1"
   */
  as?: React.ElementType
  /**
   * Whether to split and animate by "word" or individual "char" (character).
   * @default "char"
   */
  splitBy?: "word" | "char"
  /**
   * The starting rotation on the X-axis in degrees.
   * @default -90
   */
  startAngle?: number
  /**
   * Tiny starting vertical offset to create a rising hinge effect.
   * @default "0.4em"
   */
  startY?: string
  /**
   * The duration of the flip for each individual element.
   * @default 0.8
   */
  duration?: number
  /**
   * Delay before the animation begins (in seconds).
   * @default 0
   */
  delay?: number
  /**
   * The stagger delay between each element flipping.
   * @default 0.03
   */
  stagger?: number
  /**
   * If true, plays once. If false, seamlessly reverses when scrolling out of view.
   * @default true
   */
  viewportOnce?: boolean
  /**
   * Viewport threshold for when the animation should start.
   * @default "top 90%"
   */
  triggerStart?: string
}

/**
 * FlipVerticalReveal
 *
 * A 3D mechanical text reveal component for Satisium UI.
 * Simulates a split-flap display or falling dominoes by hinging characters
 * or words down from a 90-degree 3D perspective.
 *
 * @example
 * ```tsx
 * import { FlipVerticalReveal } from "@/components/ui/flip-vertical-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <FlipVerticalReveal
 *       as="h1"
 *       text="Mechanical precision."
 *       splitBy="char"
 *       stagger={0.04}
 *     />
 *   )
 * }
 * ```
 */
export const FlipVerticalReveal = React.forwardRef<
  HTMLElement,
  FlipVerticalRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = -90, // Folded completely flat, pointing away
      startY = "0.4em", // Pushed down slightly into the floor
      duration = 0.8, // Snappy mechanical speed
      delay = 0,
      stagger = 0.03, // Rapid cascade
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
          ".flip-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngle,
              y: startY,
              opacity: 0,
            },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              // back.out(1.4) creates a slightly heavier spring bounce than a Y-flip,
              // replicating gravity acting on a vertical flap.
              ease: "back.out(1.4)",
              force3D: true, // Native GPU texture lock
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

        // Accessibility Failsafe for Vestibular Disorders (Simple Fade)
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
          startAngle,
          startY,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // FOUC FIX: Set exact 3D starting coordinates
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateY(${startY}) rotateX(${startAngle}deg)`,
      // Crucial: The hinge pivot point.
      // This makes the element swing up from its baseline rather than spinning wildly on its center.
      transformOrigin: "bottom center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen readers read the whole text seamlessly
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        // The 3D Camera perspective is mandatory for depth.
        // A lower number (like 800px) creates a more aggressive, warped 3D effect.
        style={{ perspective: "800px" }}
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
                      className="flip-item inline-block"
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
                className="flip-item inline-block"
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

FlipVerticalReveal.displayName = "FlipVerticalReveal"
