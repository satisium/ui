"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface MagneticSnapRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** Duration of the elastic snap. @default 1.2 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Stagger delay between each element snapping into place. @default 0.02 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * MagneticSnapReveal
 *
 * A kinetic, elastic text reveal component for Satisium UI.
 * Elements start in randomized, chaotic coordinates (rotated, scaled, translated)
 * and magnetically snap into their correct layout positions using heavy spring physics.
 *
 * @example
 * ```tsx
 * import { MagneticSnapReveal } from "@/components/satisium-ui/magnetic-snap-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <MagneticSnapReveal
 *       as="h1"
 *       text="Chaos into order."
 *       splitBy="char"
 *     />
 *   )
 * }
 * ```
 */
export const MagneticSnapReveal = React.forwardRef<
  HTMLElement,
  MagneticSnapRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 1.2,
      delay = 0,
      stagger = 0.02, // Very fast stagger for an energetic snap
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
          ".magnetic-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // We use fromTo to safely apply chaotic randomized positions strictly on the client,
          // completely avoiding React SSR hydration mismatches.
          gsap.fromTo(
            elements,
            {
              // The Chaotic starting state
              x: () => gsap.utils.random(-40, 40),
              y: () => gsap.utils.random(-40, 40),
              rotation: () => gsap.utils.random(-25, 25),
              scale: () => gsap.utils.random(0.8, 1.2),
              opacity: 0,
            },
            {
              // The Orderly, snapped state
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration,
              delay,
              stagger,
              // elastic.out with a tight period (0.4) mimics a heavy magnetic attraction
              // that vibrates for a split second upon connection
              ease: "elastic.out(1.1, 0.4)",
              force3D: true,
              clearProps: "transform,scale,rotation,opacity", // Restores pristine native rendering
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

        // Accessibility Failsafe: Replaces flying chaos with a serene fade
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
          text,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0, // Keeps it hidden on the server to prevent FOUC
      willChange: "transform, opacity",
      display: "inline-block", // Required for transform physics
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
                      className="magnetic-item"
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
                className="magnetic-item"
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

MagneticSnapReveal.displayName = "MagneticSnapReveal"
