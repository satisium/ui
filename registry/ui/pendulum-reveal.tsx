"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface PendulumRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** Folded up into the ceiling. @default 90 */
  startAngleX?: number
  /** The slight loose hinge twist. @default -8 */
  startAngleZ?: number
  /** The duration of the swing. Elastic eases need longer durations to resolve the wobble. @default 1.6 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Stagger delay between each element dropping. @default 0.04 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * PendulumReveal
 *
 * A kinetic text reveal component for Satisium UI.
 * Elements drop down from a top hinge point, utilizing a heavy elastic
 * ease to simulate a swinging pendulum settling into place.
 *
 * @example
 * ```tsx
 * import { PendulumReveal } from "@/components/satisium-ui/pendulum-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <PendulumReveal
 *       as="h1"
 *       text="Kinetic typography."
 *       splitBy="char"
 *     />
 *   )
 * }
 * ```
 */
export const PendulumReveal = React.forwardRef<
  HTMLElement,
  PendulumRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngleX = 90,
      startAngleZ = -8, // The "loose hinge" twist
      duration = 1.6,
      delay = 0,
      stagger = 0.04, // The rippling cascade
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
          ".pendulum-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngleX,
              rotateZ: startAngleZ,
              y: "-0.3em",
              opacity: 0,
            },
            {
              rotateX: 0,
              rotateZ: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              // The Physics:
              // 1.2 is the amplitude (how far it swings past 0)
              // 0.4 is the period (how tight and heavy the swings are)
              ease: "elastic.out(1.2, 0.4)",
              force3D: true, // GPU Texture rasterization for smooth swinging
              clearProps: "transform,opacity", // Restores flawless native rendering
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
          duration,
          delay,
          stagger,
          startAngleX,
          startAngleZ,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      // Starts pushed up slightly, rotated to face the ceiling, and slightly twisted
      transform: `translateY(-0.3em) rotateX(${startAngleX}deg) rotateZ(${startAngleZ}deg)`,
      // THE ANCHOR: Hinges precisely from the top edge
      transformOrigin: "top center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
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
        // A wider perspective (1000px) gives the drop a realistic, spatial presence
        // without violently distorting the text as it swings toward the user.
        style={{ perspective: "1000px" }}
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
                      className="pendulum-item inline-block"
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
                className="pendulum-item inline-block"
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

PendulumReveal.displayName = "PendulumReveal"
