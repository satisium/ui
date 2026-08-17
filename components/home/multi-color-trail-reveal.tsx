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
  text: string
  as?: React.ElementType
  splitBy?: TrailSplitType
  edge?: TrailEdgeType
  mutedClassName?: string
  trailColors?: string[]
  finalClassName?: string
  trailLength?: number
  momentum?: number | boolean
  pin?: boolean
  triggerStart?: string
  triggerEnd?: string
}

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

        if (typeof document !== "undefined") {
          document.fonts.ready.then(() => {
            ScrollTrigger.refresh()
          })
        }

        const mm = gsap.matchMedia()

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
              invalidateOnRefresh: true,
              anticipatePin: 1, // Smooths the entry
              pinSpacing: true, // Guarantees the layout engine holds the exact pixel height
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
      // FOOLPROOF FIX: backfaceVisibility and translateZ force hardware acceleration, stopping the snap glitch
      const base: React.CSSProperties = {
        WebkitFontSmoothing: "antialiased",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }
      if (edgeType === "soft")
        return { ...base, opacity: 0, willChange: "opacity" }
      if (edgeType === "liquid")
        return {
          ...base,
          clipPath: "polygon(0% 0%, 0% 0%, 0% 50%, 0% 100%, 0% 100%)",
          willChange: "clip-path",
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

    // REWRITTEN TEXT PARSER: Flawlessly handles newlines without breaking GSAP layers
    const renderContent = () => {
      const tokens = text.split(/(\s+)/)

      return tokens.map((token, tokenIdx) => {
        // If it's whitespace (spaces or newlines)
        if (/\s+/.test(token)) {
          if (token.includes("\n")) {
            return (
              <React.Fragment key={tokenIdx}>
                {token.split("").map((char, i) =>
                  char === "\n" ? (
                    <br key={`${tokenIdx}-${i}`} />
                  ) : (
                    <span
                      key={`${tokenIdx}-${i}`}
                      className="inline-block whitespace-pre"
                    >
                      {char}
                    </span>
                  )
                )}
              </React.Fragment>
            )
          }
          return (
            <span key={tokenIdx} className="inline-block whitespace-pre">
              {token}
            </span>
          )
        }

        // If it's a word, split into chars and animate them
        if (splitBy === "char") {
          return (
            <span key={tokenIdx} className="inline-block whitespace-nowrap">
              {token
                .split("")
                .map((char, charIdx) =>
                  renderLayeredStack(char, `${tokenIdx}-${charIdx}`)
                )}
            </span>
          )
        }

        return renderLayeredStack(token, tokenIdx)
      })
    }

    const Component = as as any

    return (
      // FOOLPROOF WRAPPER: will-change-transform stops layout reflows during the pin state switch
      <div
        ref={triggerRef}
        className="relative w-full [transform:translateZ(0)] will-change-transform"
      >
        <Component
          ref={containerRef}
          aria-label={text.replace(/\n/g, " ")}
          className={cn("relative m-0 text-left", className)}
          {...props}
        >
          <span aria-hidden="true" className="inline whitespace-pre-wrap">
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

MultiColorTrailReveal.displayName = "MultiColorTrailReveal"
