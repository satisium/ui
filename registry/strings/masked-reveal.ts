export const maskedRevealHeadlineDemoString = `
import { MaskedReveal } from "@/components/satisium-ui/masked-reveal"

export default function MaskedRevealHeadlineDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center md:text-left">
        <MaskedReveal
          as="h1"
          text="Crafting highly polished, interactive digital experiences."
          className="text-5xl leading-[1.1] font-semibold tracking-tighter md:text-7xl"
          delay={0.2}
          stagger={0.04}
          splitBy="char"
          startOffset="120%"
        />
      </div>
    </main>
  )
}
`

export const maskedRevealParagraphDemoString = `
import { MaskedReveal } from "@/components/satisium-ui/masked-reveal"


export default function MaskedRevealParagraphDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to reveal</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      <section className="flex w-full items-center justify-center px-6 pb-32">
        <div className="max-w-4xl text-left md:text-justify">
          <MaskedReveal
            as="h2"
            text="Many that live deserve death. And some that die deserve life. Can you give it to them? Then do not be too eager to deal out death in judgement. For even the very wise cannot see all ends."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl md:leading-[1.3]"
            splitBy="word"
            delay={0.1}
            stagger={0.02}
            startOffset="100%"
            startRotation={8}
            viewportOnce={false}
          />
        </div>
      </section>

      <section className="h-[50vh] w-full" />
    </main>
  )
}
`

export const maskedRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface MaskedRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startOffset?: string | number
  startRotation?: number
  delay?: number
  duration?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const MaskedReveal = React.forwardRef<HTMLElement, MaskedRevealProps>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startOffset = "100%",
      startRotation = 5,
      delay = 0,
      duration = 1.2,
      stagger = 0.04,
      ease = "expo.out",
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    const resolveOffset =
      typeof startOffset === "number" ? \`\${startOffset}px\` : startOffset

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".reveal-item",
          containerRef.current
        )

        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              y: resolveOffset,
              rotationZ: startRotation,
              transformOrigin: "top left",
            },
            {
              y: "0%",
              rotationZ: 0,
              duration,
              stagger,
              delay,
              ease,
              force3D: true,
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

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { 
              opacity: 0, 
              y: resolveOffset, 
              rotationZ: startRotation 
            },
            {
              opacity: 1,
              y: "0%",
              rotationZ: 0,
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
          resolveOffset,
          startRotation,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const words = text.split(/(\\s+)/)

    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform",
      backfaceVisibility: "hidden",
      WebkitFontSmoothing: "antialiased",
      transform: \`translateY(\${resolveOffset}) rotate(\${startRotation}deg)\`,
      transformOrigin: "top left",
    }

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
                      className="inline-flex overflow-hidden"
                      style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
                    >
                      <span
                        className="reveal-item inline-block"
                        style={ssrInitialStyles}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={wordIndex}
                className="inline-flex overflow-hidden"
                style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
              >
                <span
                  className="reveal-item inline-block"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

MaskedReveal.displayName = "MaskedReveal"
`

export const maskedRevealFile = {
  "masked-reveal.tsx": {
    code: maskedRevealString,
    language: "tsx",
  },
}
