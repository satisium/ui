"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface TumblerRollRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** The starting rotation angle on the X-axis. @default 110 */
  startAngle?: number
  /** The radius of the invisible 3D cylinder. Higher = wider swing. @default "-0.8em" */
  cylinderRadius?: string
  /** Duration of the snap animation. @default 0.9 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Stagger delay between each element rolling. @default 0.04 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * TumblerRollReveal
 *
 * A mechanical 3D text reveal component for Satisium UI.
 * Characters or words roll into place along an invisible 3D cylinder,
 * mimicking the tactile snap of a combination lock or vintage split-flap display.
 *
 * @example
 * ```tsx
 * import { TumblerRollReveal } from "@/components/satisium-ui/tumbler-roll-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <TumblerRollReveal
 *       as="h1"
 *       text="Winter is coming !!!"
 *       splitBy="char"
 *     />
 *   )
 * }
 * ```
 */
export const TumblerRollReveal = React.forwardRef<
  HTMLElement,
  TumblerRollRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = 110, // Starting rolled away from the user
      cylinderRadius = "-0.8em", // The Z-axis pivot point
      duration = 0.9, // Fast, aggressive mechanical snap
      delay = 0,
      stagger = 0.04, // Rapid rolling cascade
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints safely
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".tumbler-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngle,
              opacity: 0,
            },
            {
              rotateX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              // back.out(1.2) perfectly replicates the hard click of metal slotting into place
              ease: "back.out(1.2)",
              force3D: true, // Hardware acceleration for the 3D arc
              clearProps: "transform,opacity", // Restores pristine native rendering
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
            // ABSOLUTE QUALITY FIX:
            // We MUST force rotateX to 0 instantly here, otherwise the SSR styles
            // will leave the text permanently folded backward and invisible.
            { opacity: 0, rotateX: 0 },
            {
              opacity: 1,
              rotateX: 0,
              duration: 0.5,
              delay,
              stagger,
              ease: "none",
              clearProps: "transform,opacity",
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
          duration,
          delay,
          stagger,
          startAngle,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // FOUC FIX: Set the 3D cylinder math in the initial HTML payload
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `rotateX(${startAngle}deg)`,
      // THE GENIUS: 50% X, 50% Y, and pushed backward on the Z-axis.
      // This forces the element to orbit around an invisible center point.
      transformOrigin: `50% 50% ${cylinderRadius}`,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text.replace(/\n/g, " ")} // Screen reader safe formatting
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        // A tight perspective forces the curved arc to look very dramatic
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
                      className="tumbler-item inline-block"
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
                className="tumbler-item inline-block"
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

TumblerRollReveal.displayName = "TumblerRollReveal"
