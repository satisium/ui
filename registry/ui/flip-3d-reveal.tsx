"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface Flip3DRevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The full string of text to reveal.
   * Preserves native wrapping and spacing.
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
   * The starting rotation on the Y-axis in degrees.
   * @default 90
   */
  startAngle?: number
  /**
   * Tiny starting horizontal offset to create a sliding flap effect.
   * @default "-0.2em"
   */
  startX?: string
  /**
   * Duration of the flip animation per item.
   * @default 0.8
   */
  duration?: number
  /**
   * Delay before the animation starts (in seconds).
   * @default 0
   */
  delay?: number
  /**
   * Stagger time between each item flipping.
   * @default 0.03
   */
  stagger?: number
  /**
   * If true, animates only once. If false, reverses when scrolling out of view.
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
 * Flip3DReveal
 *
 * A premium, mechanical text reveal component for Satisium UI.
 * Characters or words rotate into view along the Y-axis, creating a
 * Rolodex or split-flap display effect with a microscopic physics bounce.
 *
 * @example
 * ```tsx
 * import { Flip3DReveal } from "@/components/satisium-ui/flip-3d-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <Flip3DReveal
 *       as="h1"
 *       text="Spatial computing."
 *       splitBy="char"
 *       stagger={0.04}
 *     />
 *   )
 * }
 * ```
 */
export const Flip3DReveal = React.forwardRef<HTMLElement, Flip3DRevealProps>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = 90, // Like a coin standing perfectly on its edge
      startX = "-0.2em",
      duration = 0.8,
      delay = 0,
      stagger = 0.03,
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
              rotateY: startAngle,
              x: startX,
              opacity: 0,
            },
            {
              rotateY: 0,
              x: 0,
              opacity: 1,
              duration: duration,
              delay: delay,
              stagger: stagger,
              // back.out(1.2) creates a microscopic spring effect.
              // It snaps slightly past 0deg and settles, exactly like a physical flap.
              ease: "back.out(1.2)",
              force3D: true, // Forces GPU texture rasterization for liquid smoothness
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
              duration: 0.6,
              delay: delay,
              stagger: stagger,
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
          startX,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // FOUC FIX: Set the exact 3D starting coordinates in the SSR payload
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `rotateY(${startAngle}deg) translateX(${startX})`,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
        // The 1200px perspective creates the 3D camera lens.
        // Without this, the rotation looks flat and cheap.
        style={{ perspective: "1200px" }}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            // Native line wrapping preserved for spaces
            if (word.match(/\s+/)) {
              return (
                <span key={wordIndex} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            if (splitBy === "char") {
              return (
                <span
                  key={wordIndex}
                  className="inline-block whitespace-nowrap"
                >
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

Flip3DReveal.displayName = "Flip3DReveal"
