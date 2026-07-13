"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export type TrailEdgeType = "hard" | "liquid" | "soft"
export type TrailSplitType = "char" | "word" | "line"

export interface MultiColorTrailRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. Use \n for line breaks if using splitBy="line" */
  text: string
  /** The HTML tag to render as. @default "p" */
  as?: React.ElementType
  /** Granularity of the animation. @default "char" */
  splitBy?: TrailSplitType
  /** The type of sweep effect @default "soft" */
  edge?: TrailEdgeType
  /** Base text class before the colors sweep over it @default "text-muted-foreground/20" */
  mutedClassName?: string
  /** Array of tailwind text colors to create the wave */
  trailColors?: string[]
  /** The final solid text color after the wave passes @default "text-foreground" */
  finalClassName?: string
  /** How many elements (chars/words/lines) long the color wave is */
  trailLength?: number
  /** Amount of scroll inertia. @default 1.2 */
  momentum?: number | boolean
  /** Whether to pin the container in place during the scroll reveal @default true */
  pin?: boolean
  /** ScrollTrigger start point. Defaults to center center if pinned, top 80% if not. */
  triggerStart?: string
  /** ScrollTrigger end point. */
  triggerEnd?: string
}

/**
 * MultiColorTrailReveal
 *
 * A highly advanced scrollytelling component.
 * Sweeps a cascading wave of colors across characters, words, or lines,
 * utilizing strict clip-path physics and DOM pinning.
 */
export const MultiColorTrailReveal = React.forwardRef<
  HTMLElement,
  MultiColorTrailRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      splitBy = "char",
      edge = "soft",
      mutedClassName = "text-muted-foreground/20",
      trailColors = ["text-primary/40", "text-primary/80"],
      finalClassName = "text-foreground",
      trailLength,
      momentum = 1.2,
      pin = true,
      triggerStart = pin ? "center center" : "top 80%",
      triggerEnd,
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to safely bypass strict polymorphic DOM type constraints
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<any>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    const resolvedTrailLength =
      trailLength !== undefined
        ? trailLength
        : splitBy === "char"
          ? 12
          : splitBy === "word"
            ? 4
            : 1

    useGSAP(
      () => {
        if (!containerRef.current || !triggerRef.current) return

        const totalAnimatedLayers = trailColors.length + 1
        const layers: HTMLElement[][] = []

        for (let i = 0; i < totalAnimatedLayers; i++) {
          layers.push(
            gsap.utils.toArray<HTMLElement>(
              `.trail-layer-${i}`,
              containerRef.current
            )
          )
        }

        if (layers[0].length === 0) return

        // THE SILVER BULLET FIX FOR PIN SNAPPING:
        // Wait for custom fonts to finish loading before letting GSAP calculate heights.
        if (typeof document !== "undefined") {
          document.fonts.ready.then(() => {
            ScrollTrigger.refresh()
          })
        }

        const mm = gsap.matchMedia()

        // Distance multipliers so the pin stays locked longer,
        // absorbing native scroll momentum and guaranteeing a buttery smooth exit.
        const distanceMultiplier =
          splitBy === "char" ? 25 : splitBy === "word" ? 60 : 300
        const calculatedEnd = pin
          ? `+=${layers[0].length * distanceMultiplier}`
          : "bottom 40%"
        const finalEnd = triggerEnd || calculatedEnd

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: triggerRef.current,
              pin: pin,
              start: triggerStart,
              end: finalEnd,
              scrub: momentum,
              // Forces GSAP to recalculate perfectly if the viewport or layout shifts
              invalidateOnRefresh: true,
            },
          })

          const isSoft = edge === "soft"
          const isLiquid = edge === "liquid"

          const baseStagger =
            splitBy === "char" ? 0.05 : splitBy === "word" ? 0.15 : 0.4

          const animDuration = isSoft
            ? baseStagger * 8
            : isLiquid
              ? baseStagger * 4
              : baseStagger * 3

          const divisor = Math.max(1, totalAnimatedLayers - 1)

          // Interpolates identical polygon point structures for a flawless fluid motion
          const liquidKeyframes = [
            { clipPath: "polygon(0% 0%, 30% 0%, 50% 50%, 20% 100%, 0% 100%)" },
            { clipPath: "polygon(0% 0%, 80% 0%, 60% 50%, 90% 100%, 0% 100%)" },
            {
              clipPath: "polygon(0% 0%, 110% 0%, 110% 50%, 110% 100%, 0% 100%)",
            },
          ]

          layers.forEach((layerElements, index) => {
            const delay = index * baseStagger * (resolvedTrailLength / divisor)

            if (isSoft) {
              tl.to(
                layerElements,
                {
                  opacity: 1,
                  ease: "power1.inOut",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            } else if (isLiquid) {
              tl.to(
                layerElements,
                {
                  keyframes: liquidKeyframes,
                  ease: "none",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            } else {
              tl.to(
                layerElements,
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  ease: "none",
                  stagger: baseStagger,
                  duration: animDuration,
                  force3D: true,
                },
                delay
              )
            }
          })
        })

        // Accessibility Failsafe
        mm.add("(prefers-reduced-motion: reduce)", () => {
          layers.forEach((layerElements) => {
            if (edge === "soft") {
              gsap.set(layerElements, { opacity: 1 })
            } else {
              gsap.set(layerElements, { clipPath: "inset(0% 0% 0% 0%)" })
            }
          })
        })

        return () => mm.revert()
      },
      {
        scope: triggerRef,
        dependencies: [
          momentum,
          resolvedTrailLength,
          triggerStart,
          triggerEnd,
          pin,
          text,
          trailColors,
          edge,
          splitBy,
        ],
      }
    )

    const getSsrStyle = (edgeType: TrailEdgeType): React.CSSProperties => {
      const base: React.CSSProperties = {
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }

      if (edgeType === "soft") {
        return { ...base, opacity: 0, willChange: "opacity" }
      }
      if (edgeType === "liquid") {
        return {
          ...base,
          clipPath: "polygon(0% 0%, 0% 0%, 0% 50%, 0% 100%, 0% 100%)",
          willChange: "clip-path",
        }
      }
      return {
        ...base,
        clipPath: "inset(0% 100% 0% 0%)",
        willChange: "clip-path",
      }
    }

    const ssrInitialStyle = getSsrStyle(edge)

    const renderLayeredStack = (content: string, key: string | number) => (
      <span
        key={key}
        className="relative inline-grid whitespace-pre-wrap [grid-template-areas:'stack']"
      >
        <span className={cn("[grid-area:stack]", mutedClassName)}>
          {content}
        </span>
        {trailColors.map((colorClass, layerIdx) => (
          <span
            key={`trail-${layerIdx}`}
            className={cn(
              `trail-layer-${layerIdx} [grid-area:stack]`,
              colorClass
            )}
            style={ssrInitialStyle}
          >
            {content}
          </span>
        ))}
        <span
          className={cn(
            `trail-layer-${trailColors.length} [grid-area:stack]`,
            finalClassName
          )}
          style={ssrInitialStyle}
        >
          {content}
        </span>
      </span>
    )

    const renderContent = () => {
      if (splitBy === "line") {
        return text.split("\n").map((line, idx) => (
          <span key={idx} className="block w-full">
            {renderLayeredStack(line, idx)}
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
              {word
                .split("")
                .map((char, charIdx) =>
                  renderLayeredStack(char, `${wordIdx}-${charIdx}`)
                )}
            </span>
          )
        }

        return renderLayeredStack(word, wordIdx)
      })
    }

    const Component = as as any

    return (
      <div ref={triggerRef} className="relative w-full">
        <Component
          ref={containerRef}
          aria-label={text.replace(/\n/g, " ")} // Screen reader safe
          className={cn("relative m-0 text-left", className)}
          {...props}
        >
          <span
            aria-hidden="true"
            className="flex flex-wrap whitespace-pre-wrap"
          >
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

MultiColorTrailReveal.displayName = "MultiColorTrailReveal"
