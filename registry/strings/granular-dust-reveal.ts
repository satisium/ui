export const granularDustHeadlineDemoString = `
import { GranularDustReveal } from "@/components/ui/granular-dust-reveal"

export default function GranularDustHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <GranularDustReveal
          as="h1"
          text="Coalescing matter."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          splitBy="char"
          startingDisplacement={100}
          delay={0.2}
          duration={1.5}
          stagger={0.06}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const granularDustParagraphDemoString = `
import { GranularDustReveal } from "@/components/ui/granular-dust-reveal"

export default function GranularDustParagraphDemo() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* The Reveal Container */}
      <div className="flex h-full w-full items-center justify-center px-6">
        <div className="max-w-5xl text-left md:text-justify">
          <GranularDustReveal
            as="h2"
            text="Why do we fall, sir? So that we can learn to pick ourselves up."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word"
            triggerStart="top 85%"
            startingDisplacement={60} // Softer static for paragraphs
            duration={1.2}
            stagger={0.03}
            viewportOnce={false}
          />
        </div>
      </div>
    </main>
  )
}
`

export const granularDustRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface GranularDustRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  duration?: number
  delay?: number
  stagger?: number
  startingDisplacement?: number
  viewportOnce?: boolean
  triggerStart?: string
}

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
    const containerRef = React.useRef<any>(null)
    const mapRef = React.useRef<SVGFEDisplacementMapElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    const uniqueId = React.useId().replace(/[^a-zA-Z0-9]/g, "")
    const filterId = \`granular-dust-\${uniqueId}\`

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
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = \`url(#\${filterId})\`
              }
            },
          })

          const totalSequenceDuration = duration + elements.length * stagger

          tl.fromTo(
            mapRef.current,
            { attr: { scale: startingDisplacement } },
            {
              attr: { scale: 0 },
              duration: totalSequenceDuration,
              ease: "power3.out",
              delay,
            },
            0
          )

          tl.fromTo(
            elements,
            {
              opacity: 0,
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
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
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
              scale={startingDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        <Component
          ref={containerRef}
          aria-label={text}
          className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
          style={{ filter: \`url(#\${filterId})\` }}
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
                        className="dust-item inline-block"
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
`

export const granularDustRevealFile = {
  "granular-dust-reveal.tsx": {
    code: granularDustRevealString,
    language: "tsx",
  },
}
