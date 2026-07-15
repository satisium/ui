"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface WindShearRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "word" */
  splitBy?: "word" | "char"
  /** The starting horizontal offset. @default "1.5em" */
  startX?: string | number
  /**
   * The angle of aerodynamic drag.
   * Negative values lean left (best for left-to-right reading).
   * @default -30
   */
  startingSkew?: number
  /** The duration of the reveal for each element. @default 1.2 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Quick staggers emphasize speed. @default 0.05 */
  stagger?: number
  /** GSAP easing string. @default "back.out(1.2)" */
  ease?: string
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * WindShearReveal
 *
 * A high-velocity text reveal component for Satis UI.
 * Elements slide in while leaning heavily against simulated wind resistance,
 * utilizing elastic friction to snap forward into their resting positions.
 */
export const WindShearReveal = React.forwardRef<
  HTMLElement,
  WindShearRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "word",
      startX = "1.5em",
      startingSkew = -30,
      duration = 1.2,
      delay = 0,
      stagger = 0.05,
      ease = "back.out(1.2)", // Provides the initial velocity + aggressive friction "brake"
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to safely bypass strict polymorphic DOM type constraints
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".wind-shear-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: startX,
              skewX: startingSkew,
              opacity: 0,
            },
            {
              x: 0,
              skewX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
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
          // Instantly reset the SSR translation/skew so the text doesn't slide,
          // then perform a calm, staggered opacity fade.
          gsap.set(elements, { x: 0, skewX: 0 })

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
          startX,
          startingSkew,
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
      opacity: 0,
      transform: `translateX(${startX}) skewX(${startingSkew}deg)`,
      // Pivoting from the bottom left anchors the base of the word while the top snaps forward
      transformOrigin: "bottom left",
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
                      className="wind-shear-item"
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
                className="wind-shear-item"
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

WindShearReveal.displayName = "WindShearReveal"
