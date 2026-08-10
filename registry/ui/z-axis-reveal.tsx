"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export type ZAxisSplitType = "char" | "word" | "line"

export interface ZAxisRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text string to animate */
  text: string
  /** The HTML element to render as @default "h1" */
  as?: React.ElementType
  /** Granularity of the animation. @default "word" */
  splitBy?: ZAxisSplitType
  /** The amount of lag/inertia. Higher = more liquid feel. @default 1.5 */
  momentum?: number
  /** How massive the text starts in the Z-axis. @default 3 */
  startScale?: number
  /** Whether to apply a cinematic deep-space blur. @default true */
  blur?: boolean
  /** Whether to lock the text in place while it flies in. @default true */
  pin?: boolean
  /** GSAP ScrollTrigger start point. Default depends on pin status. */
  triggerStart?: string
  /** GSAP ScrollTrigger end point. */
  triggerEnd?: string
}

/**
 * ZAxisReveal
 *
 * A cinematic deep-space text reveal component for Satisium UI.
 * Elements fly in from the Z-axis, scaling down and un-blurring into focus.
 * Best used with DOM pinning to create immersive, Apple-style scrollytelling.
 */
export const ZAxisReveal = React.forwardRef<HTMLElement, ZAxisRevealProps>(
  (
    {
      text,
      as = "h1", // h1/h2 is usually better for this dramatic effect
      className,
      splitBy = "word",
      momentum = 1.5,
      startScale = 3,
      blur = true,
      pin = true, // Default to true because it drastically improves UX for this specific effect
      triggerStart = pin ? "center center" : "top 85%",
      triggerEnd,
      ...props
    },
    ref
  ) => {
    // Separate trigger ref prevents layout snapping when scaling large text inside a pinned container
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<any>(null) // any bypasses polymorphic TS limits
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !triggerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".z-axis-target",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        // Dynamic Pacing:
        // Adjusts the scroll distance required to finish the animation based on element count
        const distanceMultiplier =
          splitBy === "char" ? 20 : splitBy === "word" ? 40 : 150
        const calculatedEnd = pin
          ? `+=${elements.length * distanceMultiplier}`
          : "bottom 60%"
        const finalEnd = triggerEnd || calculatedEnd

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              scale: startScale,
              filter: blur ? "blur(20px)" : "blur(0px)",
              z: 1, // Forces 3D context
            },
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              z: 0,
              stagger: 0.1,
              ease: "power3.out", // Smooth deceleration as it hits the screen
              force3D: true, // Prevents rasterization jitter during scale down
              clearProps: blur ? "filter,transform" : "transform", // Restores native sub-pixel anti-aliasing!
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                anticipatePin: 1,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
                invalidateOnRefresh: true,
              },
            }
          )
        })

        // Failsafe for Vestibular Disorders
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 1, filter: "none" }, // Reset SSR scales
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              clearProps: "transform",
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: triggerRef,
        dependencies: [
          blur,
          momentum,
          startScale,
          triggerStart,
          triggerEnd,
          pin,
          splitBy,
          text,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `scale(${startScale}) translateZ(0)`,
      filter: blur ? "blur(20px)" : "none",
      transformOrigin: "center center",
      willChange: "transform, opacity, filter",
    }

    const renderContent = () => {
      if (splitBy === "line") {
        return text.split("\n").map((line, idx) => (
          <span key={idx} className="block w-full">
            <span
              className="z-axis-target block whitespace-pre-wrap"
              style={ssrInitialStyles}
            >
              {line}
            </span>
          </span>
        ))
      }

      const words = text.split(/(\s+)/)
      return words.map((word, wordIdx) => {
        if (word.match(/\s+/)) {
          return (
            <span key={wordIdx} className="inline-block whitespace-pre">
              {word}
            </span>
          )
        }

        if (splitBy === "char") {
          return (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, charIdx) => (
                <span
                  key={`${wordIdx}-${charIdx}`}
                  className="z-axis-target inline-block"
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
            key={wordIdx}
            className="z-axis-target inline-block"
            style={ssrInitialStyles}
          >
            {word}
          </span>
        )
      })
    }

    const Component = as as any

    return (
      <div ref={triggerRef} className="relative w-full">
        <Component
          ref={containerRef}
          aria-label={text} // Screen reader safe
          className={cn(
            "relative m-0 overflow-visible whitespace-pre-wrap",
            className
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className="flex flex-wrap items-center justify-center text-center"
          >
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

ZAxisReveal.displayName = "ZAxisReveal"
