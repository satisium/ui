export const weightlessFloatHeadlineDemoString = `
import { WeightlessFloatReveal } from "@/components/satisium-ui/weightless-float-reveal"

export default function WeightlessFloatHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <WeightlessFloatReveal
          as="h1"
          text="Defying gravity."
          className="text-5xl leading-[0.9] font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]"
          splitBy="char"
          startYMin={40}
          startYMax={80}
          startRotationMin={-8}
          startRotationMax={8}
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

export const weightlessFloatParagraphDemoString = `
import { WeightlessFloatReveal } from "@/components/satisium-ui/weightless-float-reveal"

export default function WeightlessFloatParagraphDemo() {
  return (
    <main className="h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-w-5xl px-6 text-left md:text-justify">
          <WeightlessFloatReveal
            as="h2"
            text="You wear your honour like a suit of armour, Stark. You think it keeps you safe, but all it does is weigh you down and make it hard for you to move."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word"
            startYMin={20}
            startYMax={50}
            startRotationMin={-3}
            startRotationMax={3}
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

export const weightlessFloatRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface WeightlessFloatRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startYMin?: number
  startYMax?: number
  startRotationMin?: number
  startRotationMax?: number
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const WeightlessFloatReveal = React.forwardRef<
  HTMLElement,
  WeightlessFloatRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startYMin = 40,
      startYMax = 80,
      startRotationMin = -8,
      startRotationMax = 8,
      duration = 2.5,
      delay = 0,
      stagger = 0.06,
      ease = "power3.out",
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".weightless-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              y: () => gsap.utils.random(startYMin, startYMax),
              rotation: () =>
                gsap.utils.random(startRotationMin, startRotationMax),
              opacity: 0,
            },
            {
              y: 0,
              rotation: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
              clearProps: "transform,opacity",
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
              clearProps: "transform",
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
          startYMin,
          startYMax,
          startRotationMin,
          startRotationMax,
          duration,
          delay,
          stagger,
          ease,
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
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
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
                      className="weightless-item"
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
                className="weightless-item"
                style={ssrInitialStyles}
              >
                {word}
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

WeightlessFloatReveal.displayName = "WeightlessFloatReveal"
`

export const weightlessFloatRevealFile = {
  "weightless-float-reveal.tsx": {
    code: weightlessFloatRevealString,
    language: "tsx",
  },
}
