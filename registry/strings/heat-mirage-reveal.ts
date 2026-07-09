export const heatMirageHeadlineDemoString = `
import { HeatMirageReveal } from "@/components/ui/heat-mirage-reveal"

export default function HeatMirageHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <HeatMirageReveal
          as="h1"
          text="Thermal dynamics."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          startingDisplacement={40}
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

export const heatMirageParagraphDemoString = `
import { HeatMirageReveal } from "@/components/ui/heat-mirage-reveal"

export default function HeatMirageParagraphDemo() {
  return (
    <main className="h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-5xl text-left md:text-justify px-6">
          <HeatMirageReveal
            as="h2"
            text="It starts as a haze, a distortion in the atmosphere. Slowly, the heat dissipates, the air cools, and the interface settles into perfect, crystalline focus."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word"
            triggerStart="top 85%"
            startingDisplacement={25}
            duration={2.5}
            stagger={0.04}
            viewportOnce={false}
          />
        </div>
      </div>
    </main>
  )
}
`

export const heatMirageRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface HeatMirageRevealProps
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
    const containerRef = React.useRef<any>(null)
    const mapRef = React.useRef<SVGFEDisplacementMapElement>(null)
    
    React.useImperativeHandle(ref, () => containerRef.current)

    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = \`heat-mirage-\${uniqueId}\`

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
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = \`url(#\${filterId})\`
              }
            },
          })

          const totalStaggerTime = duration + elements.length * stagger

          tl.fromTo(
            mapRef.current,
            { attr: { scale: startingDisplacement } },
            {
              attr: { scale: 0 },
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
              y: 20,
              scale: 1.05,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: duration * 0.8,
              delay,
              stagger,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity,scale",
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
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
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
`

export const heatMirageRevealFile = {
  "heat-mirage-reveal.tsx": {
    code: heatMirageRevealString,
    language: "tsx",
  },
}
