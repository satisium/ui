"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface MaskedRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text string to animate */
  text: string
  /** The HTML element to render as @default "div" */
  as?: React.ElementType
  /** Whether to animate word-by-word or character-by-character @default "word" */
  splitBy?: "word" | "char"
  /** The starting vertical offset. Can be percentage or pixel value @default "100%" */
  startOffset?: string | number
  /** The starting rotation on the Z-axis @default 5 */
  startRotation?: number
  /** Delay before the animation begins (in seconds) @default 0 */
  delay?: number
  /** Duration of the reveal for each element @default 1.2 */
  duration?: number
  /** Stagger delay between each element @default 0.04 */
  stagger?: number
  /** GSAP easing string @default "expo.out" */
  ease?: string
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** GSAP ScrollTrigger start point @default "top 90%" */
  triggerStart?: string
}

/**
 * MaskedReveal
 *
 * A sophisticated text reveal component for Satisium UI.
 * Wraps elements in a hidden overflow mask and pushes them up into view
 * with a slight, elegant rotation, resembling premium agency typography.
 */
export const MaskedReveal = React.forwardRef<HTMLElement, MaskedRevealProps>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startOffset = "100%",
      startRotation = 5,
      delay = 0,
      duration = 1.2,
      stagger = 0.04,
      ease = "expo.out",
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints safely
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    const resolveOffset =
      typeof startOffset === "number" ? `${startOffset}px` : startOffset

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".reveal-item",
          containerRef.current
        )

        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              y: resolveOffset,
              rotationZ: startRotation,
              transformOrigin: "top left",
            },
            {
              y: "0%",
              rotationZ: 0,
              duration,
              stagger,
              delay,
              ease,
              force3D: true,
              clearProps: "transform", // Removes inline transform to restore native rendering
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
            {
              opacity: 0,
              // Must reset the transform here because the SSR styles push it down
              y: resolveOffset,
              rotationZ: startRotation,
            },
            {
              opacity: 1,
              y: "0%",
              rotationZ: 0,
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
          resolveOffset,
          startRotation,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const words = text.split(/(\s+)/)

    // FOUC FIX: Set the exact initial state right in the DOM
    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform",
      backfaceVisibility: "hidden",
      WebkitFontSmoothing: "antialiased",
      transform: `translateY(${resolveOffset}) rotate(${startRotation}deg)`,
      transformOrigin: "top left",
    }

    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader safe
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
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
                      // The Outer Mask Layer
                      className="inline-flex overflow-hidden"
                      // padding allows descenders (like 'g', 'p') to not be clipped abruptly
                      style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
                    >
                      <span
                        // The Inner Animated Layer
                        className="reveal-item inline-block"
                        style={ssrInitialStyles}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={wordIndex}
                className="inline-flex overflow-hidden"
                style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
              >
                <span
                  className="reveal-item inline-block"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

MaskedReveal.displayName = "MaskedReveal"
