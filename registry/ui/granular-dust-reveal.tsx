"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface GranularDustRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. Supports wrapping. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "word" */
  splitBy?: "word" | "char"
  /** Duration of the individual element reveal. @default 1.5 */
  duration?: number
  delay?: number
  /** Stagger time between items. @default 0.04 */
  stagger?: number
  /** How aggressively the text is shattered into dust at the start. @default 80 */
  startingDisplacement?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * GranularDustReveal
 *
 * A cinematic text reveal for Satisium UI.
 * Uses microscopic SVG fractal noise to shatter typography into granular sand,
 * dynamically coalescing into pristine, anti-aliased text.
 *
 * @example
 * ```tsx
 * import { GranularDustReveal } from "@/components/ui/granular-dust-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <GranularDustReveal
 *       as="h1"
 *       text="From dust to clarity."
 *       splitBy="char"
 *     />
 *   )
 * }
 * ```
 */
export const GranularDustReveal = React.forwardRef<
  HTMLElement,
  GranularDustRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "word",
      duration = 1.5,
      delay = 0,
      stagger = 0.04,
      startingDisplacement = 80,
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints securely
    const containerRef = React.useRef<any>(null)
    const mapRef = React.useRef<SVGFEDisplacementMapElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    // Unique ID ensures multiple components don't share the same SVG filter
    const uniqueId = React.useId().replace(/[^a-zA-Z0-9]/g, "")
    const filterId = `granular-dust-${uniqueId}`

    useGSAP(
      () => {
        if (!containerRef.current || !mapRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".dust-item",
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
              // The SVG filter destroys native anti-aliasing.
              // We remove the filter completely when the timeline finishes.
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = `url(#${filterId})`
              }
            },
          })

          // Calculate exactly how long the entire stagger sequence will take
          const totalSequenceDuration = duration + elements.length * stagger

          // 1. Global Dust Settling
          // By linking this to totalSequenceDuration, the dust clears perfectly
          // in sync with the final staggered word snapping into place.
          tl.fromTo(
            mapRef.current,
            { attr: { scale: startingDisplacement } },
            {
              attr: { scale: 0 },
              duration: totalSequenceDuration,
              ease: "power3.out", // Decelerates like particles losing momentum
              delay,
            },
            0
          )

          // 2. Individual Elements Materializing
          tl.fromTo(
            elements,
            {
              opacity: 0,
              // Randomized scale & Y offset gives the illusion of particles forming from 3D space
              scale: () => gsap.utils.random(1.05, 1.2),
              y: () => gsap.utils.random(-15, 15),
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration,
              delay,
              stagger,
              ease: "power3.out",
              force3D: true,
            },
            0
          )
        })

        // Accessibility Failsafe for Vestibular Disorders (Smooth Fade)
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
          duration,
          delay,
          stagger,
          startingDisplacement,
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
        {/* Web Standards: Hidden SVG Filter Engine */}
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          {/* Expanded bounds allow the dust particles to scatter wide without clipping */}
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            {/* 
              THE PHYSICS: Microscopic High-Frequency Noise
              Pushing the frequency to 0.8 creates ultra-dense, pixel-level static. 
              This shatters the source graphic into tiny disconnected dots.
            */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8 0.8"
              numOctaves="1"
              result="STATIC"
            />
            <feDisplacementMap
              ref={mapRef}
              in="SourceGraphic"
              in2="STATIC"
              scale={startingDisplacement} // Controlled via GSAP
              xChannelSelector="R"
              yChannelSelector="G"
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
          // Filter is pre-applied to prevent initial frame flashing
          style={{ filter: `url(#${filterId})` }}
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
                        className="dust-item inline-block"
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
                  className="dust-item inline-block"
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

GranularDustReveal.displayName = "GranularDustReveal"
