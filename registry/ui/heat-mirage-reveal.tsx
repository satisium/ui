"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface HeatMirageRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** Base duration for the text reveal. @default 2.5 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** The stagger delay between each element revealing. @default 0.08 */
  stagger?: number
  /** How intense the thermal waving is at the start. @default 35 */
  startingDisplacement?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 85%" */
  triggerStart?: string
}

/**
 * HeatMirageReveal
 *
 * A cinematic atmospheric reveal component for Satisium UI.
 * Uses an SVG displacement map to simulate atmospheric thermal distortion (heat waves).
 * The text drifts upward and materializes as the heat dissipates into sharp focus.
 *
 * @example
 * ```tsx
 * import { HeatMirageReveal } from "@/components/ui/heat-mirage-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <HeatMirageReveal
 *       as="h1"
 *       text="Thermal dynamics."
 *       splitBy="char"
 *       startingDisplacement={40}
 *     />
 *   )
 * }
 * ```
 */
export const HeatMirageReveal = React.forwardRef<
  HTMLElement,
  HeatMirageRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 2.5,
      delay = 0,
      stagger = 0.08,
      startingDisplacement = 35,
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to bypass strict polymorphic DOM type constraints
    const containerRef = React.useRef<any>(null)
    const mapRef = React.useRef<SVGFEDisplacementMapElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    // Unique ID ensures multiple components don't share the same SVG filter
    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = `heat-mirage-${uniqueId}`

    useGSAP(
      () => {
        if (!containerRef.current || !mapRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".mirage-item",
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
              // Instantly remove the SVG filter the millisecond the animation hits 100%
              // to restore flawless native sub-pixel anti-aliasing.
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = `url(#${filterId})`
              }
            },
          })

          // Calculate exactly how long the entire staggered sequence takes.
          // This prevents the heat wave from dissipating before the final letters even appear.
          const totalStaggerTime = duration + elements.length * stagger

          // 1. Animate the Heat Dissipating (Global SVG Filter)
          tl.fromTo(
            mapRef.current,
            { attr: { scale: startingDisplacement } },
            {
              attr: { scale: 0 },
              duration: totalStaggerTime,
              ease: "power2.out", // Fast initial cool-down, long shimmering tail
              delay,
            },
            0
          )

          // 2. Animate the Text Materializing
          tl.fromTo(
            elements,
            {
              opacity: 0,
              y: 20, // Drift up from below, mimicking rising heat
              scale: 1.05, // Slightly expanded as if refracted through hot air
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: duration * 0.8, // Snaps into focus slightly faster than the heat dissipates
              delay,
              stagger,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity,scale", // Clean up inline styles
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
        {/* Web Standards: Hidden SVG Filter rendered outside the component to prevent recursive distortion bugs */}
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          {/* Expanded bounds prevent the distorted edges from clipping */}
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {/* 
              THE PHYSICS: Asymmetrical Frequency
              X-axis is low (0.01) = Wide horizontal waves
              Y-axis is high (0.25) = Tight vertical compression
              Result: Rapid, wavering horizontal bands like atmospheric thermal distortion.
            */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.25"
              numOctaves="2"
              result="HEAT_WAVES"
            />
            <feDisplacementMap
              ref={mapRef}
              in="SourceGraphic"
              in2="HEAT_WAVES"
              scale={startingDisplacement}
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
                        className="mirage-item"
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
                  className="mirage-item"
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

HeatMirageReveal.displayName = "HeatMirageReveal"
