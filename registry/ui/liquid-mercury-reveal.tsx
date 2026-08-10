"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface LiquidMercuryRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** Duration of the elastic snap for each element. @default 2.5 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** The stagger delay between each element revealing. @default 0.05 */
  stagger?: number
  /** How heavily blurred/liquid the text is at the start. @default 12 */
  startingBlur?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * LiquidMercuryReveal
 *
 * An elastic, metallic text reveal component for Satisium UI.
 * Elements spawn from inside the previous element's mass, stretching a
 * gooey liquid bridge that elastically snaps into sharp, crisp typography.
 *
 * @example
 * ```tsx
 * import { LiquidMercuryReveal } from "@/components/ui/liquid-mercury-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <LiquidMercuryReveal
 *       as="h1"
 *       text="Liquid metal."
 *       splitBy="char"
 *       startingBlur={16}
 *     />
 *   )
 * }
 * ```
 */
export const LiquidMercuryReveal = React.forwardRef<
  HTMLElement,
  LiquidMercuryRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 2.5,
      delay = 0,
      stagger = 0.05,
      startingBlur = 12,
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints safely
    const containerRef = React.useRef<any>(null)
    const blurRef = React.useRef<SVGFEGaussianBlurElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    // Unique ID ensures multiple components don't share the same SVG filter
    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = `liquid-mercury-${uniqueId}`

    useGSAP(
      () => {
        if (!containerRef.current || !blurRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".mercury-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: triggerStart,
              once: viewportOnce,
              toggleActions: viewportOnce
                ? "play none none none"
                : "play none none reverse",
            },
            onUpdate: function () {
              if (!containerRef.current) return
              // ABSOLUTE QUALITY FIX:
              // Instantly remove the SVG filter the exact millisecond the animation hits 100%.
              // This restores native browser sub-pixel anti-aliasing without any visual popping.
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = `url(#${filterId})`
              }
            },
          })

          // Calculate exact sequence completion time so the blur fades perfectly in sync
          const totalStaggerTime = duration + (elements.length - 1) * stagger

          // 1. Animate the Liquid Cooling (Global SVG Filter)
          tl.fromTo(
            blurRef.current,
            { attr: { stdDeviation: startingBlur } },
            {
              attr: { stdDeviation: 0 },
              duration: totalStaggerTime,
              ease: "power2.out",
              delay,
            },
            0
          )

          // 2. Animate the Droplets Separating (Element-by-element)
          tl.fromTo(
            elements,
            {
              opacity: 0,
              // Pulling from the left ensures they spawn INSIDE the previous element's liquid mass
              x: -40,
              scale: 0.8,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: duration,
              delay,
              stagger,
              // The heavy elastic overshoot forces the gooey bridge to stretch, snap, and vibrate
              ease: "elastic.out(1.2, 0.4)",
              force3D: true,
              clearProps: "transform,scale,opacity", // Clean up inline styles
            },
            0
          )
        })

        // Accessibility Failsafe for Vestibular Disorders
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
          startingBlur,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      willChange: "transform, opacity",
      display: "inline-block",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <>
        {/* Web Standards: Hidden SVG Filter placed OUTSIDE the styled component */}
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {/* 1. Heavily blur the incoming elements */}
            <feGaussianBlur
              ref={blurRef}
              in="SourceGraphic"
              stdDeviation={startingBlur}
              result="BLUR"
            />
            {/* 2. ColorMatrix Alpha Threshold: 
                This math crushes the Alpha channel. If the blurred alpha is below ~0.4, 
                it becomes 0. If it's above, it becomes 1. This creates the solid gooey fusion. */}
            <feColorMatrix
              in="BLUR"
              mode="matrix"
              values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 20 -8"
              result="GOOEY"
            />
          </filter>
        </svg>

        <Component
          ref={containerRef}
          aria-label={text} // Screen reader safe
          className={cn(
            "flex flex-wrap text-left whitespace-pre-wrap",
            className
          )}
          style={{
            filter: `url(#${filterId})`,
            WebkitTransform: "translateZ(0)", // Hardware acceleration lock
          }}
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
                  <span
                    key={wordIndex}
                    className="inline-flex whitespace-nowrap"
                  >
                    {word.split("").map((char, charIndex) => (
                      <span
                        key={`${wordIndex}-${charIndex}`}
                        className="mercury-item"
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
                  className="mercury-item"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              )
            })}
          </span>
        </Component>
      </>
    )
  }
)

LiquidMercuryReveal.displayName = "LiquidMercuryReveal"
