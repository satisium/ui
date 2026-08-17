export const elasticPopHeadlineDemoString = `
import { ElasticPopReveal } from "@/components/satisium-ui/elastic-pop-reveal"

export default function ElasticPopHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <ElasticPopReveal
          as="h1"
          text="Fluid physics. Tactile typography."
          className="text-5xl leading-[1.1] font-black tracking-tighter md:text-7xl lg:text-8xl"
          delay={0.1}
          splitBy="char"
          startScale={0.5} 
          duration={1.8} 
          stagger={0.03}
          ease="elastic.out(1.2, 0.3)"
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const elasticPopParagraphDemoString = `
import { ElasticPopReveal } from "@/components/satisium-ui/elastic-pop-reveal"

export default function ElasticPopParagraphDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-center">
          <ElasticPopReveal
            as="h2"
            text="Meticulously crafted components for modern web applications. Elevate your interface with uncompromising performance, accessibility, and refined design."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="word"
            triggerStart="top 85%"
            startScale={0.8}
            startOpacity={0}
            duration={1.2}
            stagger={0.02}
            ease="elastic.out(1, 0.5)"
            viewportOnce={false}
          />
        </div>
      </div>
    </main>
  )
}
`

export const elasticPopRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ElasticPopRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startScale?: number
  startOpacity?: number
  delay?: number
  ease?: string
  duration?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const ElasticPopReveal = React.forwardRef<
  HTMLElement,
  ElasticPopRevealProps
>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startScale = 0.5,
      startOpacity = 0,
      delay = 0,
      duration = 1.5,
      stagger = 0.05,
      ease = "elastic.out(1, 0.4)",
      viewportOnce = true,
      triggerStart = "top 90%",
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
          ".pop-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            { scale: startScale, opacity: startOpacity },
            {
              scale: 1,
              opacity: 1,
              duration,
              stagger,
              delay,
              ease,
              force3D: true,
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
            { opacity: startOpacity },
            {
              opacity: 1,
              duration: 0.5,
              stagger,
              delay,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
          startScale,
          startOpacity,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform, opacity",
      opacity: startOpacity,
      transform: \`scale(\${startScale})\`,
      transformOrigin: "center center",
    }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
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
                      className="pop-item inline-block"
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
                className="pop-item inline-block"
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

ElasticPopReveal.displayName = "ElasticPopReveal"
`

export const elasticPopRevealFile = {
  "elastic-pop-reveal.tsx": {
    code: elasticPopRevealString,
    language: "tsx",
  },
}
