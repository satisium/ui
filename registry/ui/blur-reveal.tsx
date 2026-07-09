"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface BlurRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The full string of text to reveal. Supports newlines and formatting. */
  text: string
  /** The HTML tag to render as. @default "p" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "word" */
  splitBy?: "word" | "char"
  /** Whether to apply a cinematic blur while revealing. @default true */
  blur?: boolean
  /** The duration of the reveal for each individual block. @default 1 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** The stagger delay between each element revealing. @default 0.03 */
  stagger?: number
  /** GSAP easing function for the animation. @default "power3.out" */
  ease?: string
  /** If true, plays once. If false, seamlessly reverses when scrolling out of view. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * BlurReveal
 *
 * A cinematic, 3D text reveal component for Satis UI.
 * Characters or words sweep in from an angled, blurry 3D perspective,
 * utilizing deep easing to create a heavy, dramatic reveal.
 *
 * @example
 * ```tsx
 * import { BlurReveal } from "@/components/ui/blur-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <BlurReveal
 *       as="h1"
 *       text="Motion creates emotion."
 *       splitBy="char"
 *       blur={true}
 *     />
 *   )
 * }
 * ```
 */
export const BlurReveal = React.forwardRef<HTMLElement, BlurRevealProps>(
  (
    {
      text,
      as = "p",
      className,
      splitBy = "word",
      blur = true,
      duration = 1,
      delay = 0,
      stagger = 0.03,
      ease = "power3.out", // Deep deceleration for that cinematic feel
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints securely
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".blur-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              y: 40,
              rotateX: -50,
              filter: blur ? "blur(12px)" : "none",
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: blur ? "blur(0px)" : "none",
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
              // ABSOLUTE QUALITY FIX:
              // clearProps rips the filter off the DOM node the exact millisecond the tween finishes,
              // instantly snapping the text back to flawless, native browser crispness.
              clearProps: blur ? "filter" : "",
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
          blur,
          duration,
          delay,
          stagger,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // Pre-applied to prevent Flash of Unstyled Content (FOUC)
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: "translateY(40px) rotateX(-50deg)",
      filter: blur ? "blur(12px)" : "none",
      transformOrigin: "bottom center",
      willChange: "transform, opacity, filter",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen readers will read this cleanly
        className={cn("relative m-0 whitespace-pre-wrap", className)}
        style={{ perspective: "1000px" }} // Perspective forces the rotateX to have physical 3D depth
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
                      className="blur-item inline-block"
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
                className="blur-item inline-block"
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

BlurReveal.displayName = "BlurReveal"
