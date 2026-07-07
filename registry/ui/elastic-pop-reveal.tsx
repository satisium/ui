"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ElasticPopRevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The full string of text to reveal.
   * Automatically splits by word or character while preserving native spacing.
   */
  text: string
  /**
   * The HTML tag to render as.
   * @default "div"
   */
  as?: React.ElementType
  /**
   * Whether to split and animate by "word" or individual "char" (character).
   * @default "word"
   */
  splitBy?: "word" | "char"
  /**
   * Starting scale of the element before it pops in.
   * @default 0.5
   */
  startScale?: number
  /**
   * Starting opacity of the element.
   * @default 0
   */
  startOpacity?: number
  /**
   * Delay before the animation begins (in seconds).
   * @default 0
   */
  delay?: number
  /**
   * Elastic easing configuration.
   * Format: "elastic.out(amplitude, frequency)"
   * @default "elastic.out(1, 0.4)"
   */
  ease?: string
  /**
   * The duration of the reveal for each individual block.
   * Elastic eases usually need > 1s to finish oscillating naturally.
   * @default 1.5
   */
  duration?: number
  /**
   * The stagger delay between each word/char revealing.
   * @default 0.05
   */
  stagger?: number
  /**
   * If true, the animation only plays once. If false, it seamlessly reverses when scrolling out of view.
   * @default true
   */
  viewportOnce?: boolean
  /**
   * Viewport threshold for when the animation should start.
   * Format: "[element point] [viewport point]"
   * @default "top 90%"
   */
  triggerStart?: string
}

/**
 * ElasticPopReveal
 *
 * A tactile, physics-based text reveal component for Satis UI.
 * Splinters text into words or characters and scales them in with a highly
 * customizable GSAP elastic spring effect, triggered on scroll.
 *
 * @example
 * ```tsx
 * import { ElasticPopReveal } from "@/components/ui/elastic-pop-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <ElasticPopReveal
 *       as="h1"
 *       text="Spring-driven typography."
 *       splitBy="char"
 *       stagger={0.02}
 *       ease="elastic.out(1.2, 0.3)"
 *     />
 *   )
 * }
 * ```
 */
export const ElasticPopReveal = React.forwardRef<
  HTMLElement,
  ElasticPopRevealProps
>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startScale = 0.5,
      startOpacity = 0,
      delay = 0,
      duration = 1.5,
      stagger = 0.05,
      ease = "elastic.out(1, 0.4)",
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints safely without losing outer TS inference
    const containerRef = React.useRef<any>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".pop-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              scale: startScale,
              opacity: startOpacity,
            },
            {
              scale: 1,
              opacity: 1,
              duration,
              stagger,
              delay,
              ease,
              force3D: true, // Forces hardware acceleration for perfectly smooth spring rendering
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
                toggleActions: viewportOnce
                  ? "play none none none"
                  : "play none none reverse",
              },
            }
          )
        })

        // Accessibility Failsafe for Vestibular Disorders (Disables motion, retains opacity fade)
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: startOpacity },
            {
              opacity: 1,
              duration: 0.5,
              stagger,
              delay,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
          startScale,
          startOpacity,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    // Strictly prevents FOUC. Elements start scaled down and invisible on SSR.
    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform, opacity",
      opacity: startOpacity,
      transform: `scale(${startScale})`,
      transformOrigin: "center center",
    }

    // Split text by whitespace, preserving the spaces in the array so native wrapping works
    const words = text.split(/(\s+)/)

    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Allows screen readers to read the text fluently as a single sentence
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            // Render spaces properly without treating them as animated items
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
                      className="pop-item inline-block"
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
                className="pop-item inline-block"
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

ElasticPopReveal.displayName = "ElasticPopReveal"
