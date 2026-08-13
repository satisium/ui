export const zAxisCharDemoString = `
import { ZAxisReveal } from "@/components/satisium-ui/z-axis-reveal"

export default function ZAxisCharDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      <section className="flex w-full items-center justify-center px-6">
        <div className="max-w-6xl">
          <ZAxisReveal
            as="h2"
            splitBy="char"
            pin={true} 
            startScale={4}
            blur={true}
            momentum={1.5}
            text="People work together, when it suits them. They're loyal, when it suits them. They love each other, when it suits them. And they kill each other, when it suits them."
            className="text-4xl leading-[1.3] font-medium tracking-tight md:text-6xl"
          />
        </div>
      </section>

      <section className="h-screen w-full" />
    </main>
  )
}
`

export const zAxisWordDemoString = `
import { ZAxisReveal } from "@/components/satisium-ui/z-axis-reveal"

export default function ZAxisWordDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      <section className="flex w-full items-center justify-center px-6">
        <div className="max-w-6xl">
          <ZAxisReveal
            as="h2"
            splitBy="word"
            pin={true}
            startScale={4}
            blur={true}
            momentum={1.5}
            text="People work together, when it suits them. They're loyal, when it suits them. They love each other, when it suits them. And they kill each other, when it suits them."
            className="text-4xl leading-[1.3] font-medium tracking-tight md:text-6xl"
          />
        </div>
      </section>

      <section className="h-screen w-full" />
    </main>
  )
}
`

export const zAxisRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export type ZAxisSplitType = "char" | "word" | "line"

export interface ZAxisRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: ZAxisSplitType
  momentum?: number
  startScale?: number
  blur?: boolean
  pin?: boolean
  triggerStart?: string
  triggerEnd?: string
}

export const ZAxisReveal = React.forwardRef<HTMLElement, ZAxisRevealProps>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "word",
      momentum = 1.5,
      startScale = 3,
      blur = true,
      pin = true,
      triggerStart = pin ? "center center" : "top 85%",
      triggerEnd,
      ...props
    },
    ref
  ) => {
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !triggerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".z-axis-target",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        const distanceMultiplier =
          splitBy === "char" ? 20 : splitBy === "word" ? 40 : 150
        const calculatedEnd = pin
          ? \`+=\${elements.length * distanceMultiplier}\`
          : "bottom 60%"
        const finalEnd = triggerEnd || calculatedEnd

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              scale: startScale,
              filter: blur ? "blur(20px)" : "blur(0px)",
              z: 1,
            },
            {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              z: 0,
              stagger: 0.1,
              ease: "power3.out",
              force3D: true,
              clearProps: blur ? "filter,transform" : "transform",
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                anticipatePin: 1,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
                invalidateOnRefresh: true,
              },
            }
          )
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 1, filter: "none" },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              clearProps: "transform",
              scrollTrigger: {
                trigger: triggerRef.current,
                pin: pin,
                start: triggerStart,
                end: finalEnd,
                scrub: momentum,
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: triggerRef,
        dependencies: [
          blur,
          momentum,
          startScale,
          triggerStart,
          triggerEnd,
          pin,
          splitBy,
          text,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: \`scale(\${startScale}) translateZ(0)\`,
      filter: blur ? "blur(20px)" : "none",
      transformOrigin: "center center",
      willChange: "transform, opacity, filter",
    }

    const renderContent = () => {
      if (splitBy === "line") {
        return text.split("\\n").map((line, idx) => (
          <span key={idx} className="block w-full">
            <span
              className="z-axis-target block whitespace-pre-wrap"
              style={ssrInitialStyles}
            >
              {line}
            </span>
          </span>
        ))
      }

      const words = text.split(/(\\s+)/)
      return words.map((word, wordIdx) => {
        if (word.match(/\\s+/)) {
          return (
            <span key={wordIdx} className="inline-block whitespace-pre">
              {word}
            </span>
          )
        }

        if (splitBy === "char") {
          return (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, charIdx) => (
                <span
                  key={\`\${wordIdx}-\${charIdx}\`}
                  className="z-axis-target inline-block"
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
            key={wordIdx}
            className="z-axis-target inline-block"
            style={ssrInitialStyles}
          >
            {word}
          </span>
        )
      })
    }

    const Component = as as any

    return (
      <div ref={triggerRef} className="relative w-full">
        <Component
          ref={containerRef}
          aria-label={text}
          className={cn(
            "relative m-0 overflow-visible whitespace-pre-wrap",
            className
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className="flex flex-wrap items-center justify-center text-center"
          >
            {renderContent()}
          </span>
        </Component>
      </div>
    )
  }
)

ZAxisReveal.displayName = "ZAxisReveal"
`

export const zAxisRevealFile = {
  "z-axis-reveal.tsx": {
    code: zAxisRevealString,
    language: "tsx",
  },
}
