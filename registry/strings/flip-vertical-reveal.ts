export const flipVerticalHeadlineDemoString = `
import { FlipVerticalReveal } from "@/components/satisium-ui/flip-vertical-reveal"

export default function FlipVerticalHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <FlipVerticalReveal
          as="h1"
          text="Elevating the standard."
          className="text-6xl leading-[1.1] font-semibold tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={0.9}
          stagger={0.04} 
        />
      </div>
    </main>
  )
}
`

export const flipVerticalParagraphDemoString = `
import { FlipVerticalReveal } from "@/components/satisium-ui/flip-vertical-reveal"

export default function FlipVerticalParagraphDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <FlipVerticalReveal
            as="h2"
            text="Letters that don't just appear, but arrive. It brings a satisfying, mechanical rhythm to the screen, folding each character seamlessly into the viewport like a perfectly synchronized cascade."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            splitBy="char" 
            triggerStart="top 85%"
            duration={0.8}
            stagger={0.015} // Slightly faster stagger for paragraphs so the narrative flows well
            viewportOnce={false} 
          />
        </div>
      </div>
    </main>
  )
}
`

export const flipVerticalRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FlipVerticalRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startAngle?: number
  startY?: string
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const FlipVerticalReveal = React.forwardRef<
  HTMLElement,
  FlipVerticalRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = -90,
      startY = "0.4em",
      duration = 0.8,
      delay = 0,
      stagger = 0.03,
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
          ".flip-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngle,
              y: startY,
              opacity: 0,
            },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(1.4)",
              force3D: true,
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
          startAngle,
          startY,
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
      transform: \`translateY(\${startY}) rotateX(\${startAngle}deg)\`,
      transformOrigin: "bottom center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
        style={{ perspective: "800px" }}
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
                      className="flip-item inline-block"
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
                className="flip-item inline-block"
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

FlipVerticalReveal.displayName = "FlipVerticalReveal"
`

export const flipVerticalRevealFile = {
  "flip-vertical-reveal.tsx": {
    code: flipVerticalRevealString,
    language: "tsx",
  },
}
