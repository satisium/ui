"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FluidInkRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** The starting blur size of the ink blob. @default "12px" */
  startBlur?: string
  /** The duration of the reveal for each individual element. @default 1.4 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** The stagger delay between each element revealing. @default 0.08 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

export const FluidInkReveal = React.forwardRef<
  HTMLElement,
  FluidInkRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startBlur = "12px",
      duration = 1.4,
      delay = 0,
      stagger = 0.08,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    const matrixRef = React.useRef<SVGFEColorMatrixElement>(null)
    const filterId = React.useId()

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".ink-item",
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
          })

          // Proxy object to smoothly animate the SVG feColorMatrix values
          const matrixProxy = { a: 18, b: -7 }

          // 1. Set initial states securely
          tl.set(containerRef.current, { filter: `url(#goo-${filterId})` })
          tl.set(matrixProxy, { a: 18, b: -7 })

          // 2. The Main Liquid Stagger
          tl.fromTo(
            elements,
            {
              opacity: 0,
              filter: `blur(${startBlur})`,
              scale: 1.1,
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
              duration,
              delay,
              stagger,
              ease: "power2.inOut",
              force3D: true,
            }
          )

          // 3. Smoothly Un-warp the Matrix
          // This animates the SVG alpha threshold back to native levels (1 and 0).
          // By overlapping this with the tail end of the stagger, we completely eliminate the "snap".
          tl.to(
            matrixProxy,
            {
              a: 1,
              b: 0,
              duration: 0.6,
              ease: "power2.out",
              onUpdate: () => {
                if (matrixRef.current) {
                  matrixRef.current.setAttribute(
                    "values",
                    `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${matrixProxy.a} ${matrixProxy.b}`
                  )
                }
              },
            },
            "-=0.6" // Overlaps exactly with the end of the reveal
          )

          // 4. Safe Removal
          // Now that the matrix matches native rendering, we can safely remove the CSS filter.
          tl.set(containerRef.current, { filter: "none" })
        })

        // Accessibility Failsafe
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
          startBlur,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      filter: `blur(${startBlur})`,
      transform: "scale(1.1)",
      willChange: "opacity, filter, transform",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <>
        {/* Invisible SVG filter targeting the Alpha Channel */}
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          <defs>
            <filter id={`goo-${filterId}`}>
              <feColorMatrix
                ref={matrixRef}
                in="SourceGraphic"
                type="matrix"
                values="
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 18 -7
                "
              />
            </filter>
          </defs>
        </svg>

        <Component
          ref={containerRef}
          aria-label={text}
          className={cn(
            "flex flex-wrap text-left whitespace-pre-wrap",
            className
          )}
          style={{
            filter: `url(#goo-${filterId})`,
            WebkitTransform: "translateZ(0)",
            padding: "0.2em 0",
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
                        className="ink-item inline-block"
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
                  className="ink-item inline-block"
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

FluidInkReveal.displayName = "FluidInkReveal"
