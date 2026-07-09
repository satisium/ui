export const blurRevealHeadlineDemoString = `
import { BlurReveal } from "@/components/ui/blur-reveal"

export default function BlurRevealHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <BlurReveal
          as="h1"
          text="Motion creates emotion."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-7xl"
          splitBy="char"
          blur={true}
          delay={0.2}
          duration={1.2}
          stagger={0.04}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const blurRevealParagraphDemoString = `
import { BlurReveal } from "@/components/ui/blur-reveal"

export default function BlurRevealParagraphDemo() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      <div className="flex w-full items-center justify-center px-6 pt-[90vh] pb-[25vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <BlurReveal
            as="h2"
            text="We craft highly polished, satisfying interfaces that feel awesome, seamlessly fluid, and entirely effortless. Everything serves a purpose."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="char"
            blur={true}
            triggerStart="top 85%"
            duration={1.2}
            stagger={0.03}
            ease="power3.out"
            viewportOnce={false}
          />
        </div>
      </div>
    </main>
  )
}
`

export const blurRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface BlurRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  blur?: boolean
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const BlurReveal = React.forwardRef<
  HTMLElement,
  BlurRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      splitBy = "word",
      blur = true,
      duration = 1,
      delay = 0,
      stagger = 0.03,
      ease = "power3.out",
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".blur-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              y: 40,
              rotateX: -50,
              filter: blur ? "blur(12px)" : "none",
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: blur ? "blur(0px)" : "none",
              duration,
              delay,
              stagger,
              ease,
              force3D: true,
              clearProps: blur ? "filter" : "",
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
          blur,
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
      transform: "translateY(40px) rotateX(-50deg)",
      filter: blur ? "blur(12px)" : "none",
      transformOrigin: "bottom center",
      willChange: "transform, opacity, filter",
    }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative m-0 whitespace-pre-wrap", className)}
        style={{ perspective: "1000px" }}
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
                      className="blur-item inline-block"
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
                className="blur-item inline-block"
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

BlurReveal.displayName = "BlurReveal"
`

export const blurRevealFile = {
  "blur-reveal.tsx": {
    code: blurRevealString,
    language: "tsx",
  },
}
