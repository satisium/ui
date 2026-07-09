export const liquidMercuryHeadlineDemoString = `
import { LiquidMercuryReveal } from "@/components/ui/liquid-mercury-reveal"

export default function LiquidMercuryHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <LiquidMercuryReveal
          as="h1"
          text="Elastic physics."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          startingBlur={12}
          delay={0.2}
          duration={2.5}
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const liquidMercuryRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface LiquidMercuryRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  duration?: number
  delay?: number
  stagger?: number
  startingBlur?: number
  viewportOnce?: boolean
  triggerStart?: string
}

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
    const containerRef = React.useRef<any>(null)
    const blurRef = React.useRef<SVGFEGaussianBlurElement>(null)
    
    React.useImperativeHandle(ref, () => containerRef.current)

    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = \`liquid-mercury-\${uniqueId}\`

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
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = \`url(#\${filterId})\`
              }
            },
          })

          const totalStaggerTime = duration + (elements.length - 1) * stagger

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

          tl.fromTo(
            elements,
            {
              opacity: 0,
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
              ease: "elastic.out(1.2, 0.4)",
              force3D: true,
              clearProps: "transform,scale,opacity",
            },
            0
          )
        })

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

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <>
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
            <feGaussianBlur
              ref={blurRef}
              in="SourceGraphic"
              stdDeviation={startingBlur}
              result="BLUR"
            />
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
          aria-label={text}
          className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
          style={{
            filter: \`url(#\${filterId})\`,
            WebkitTransform: "translateZ(0)",
          }}
          {...props}
        >
          <span aria-hidden="true" className="flex flex-wrap">
            {words.map((word, wordIndex) => {
              if (word.match(/\\s+/)) {
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
                        key={\`\${wordIndex}-\${charIndex}\`}
                        className="mercury-item"
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
`

export const liquidMercuryRevealFile = {
  "liquid-mercury-reveal.tsx": {
    code: liquidMercuryRevealString,
    language: "tsx",
  },
}
