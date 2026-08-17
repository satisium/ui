export const velocityBrakeDemoString = `
import { VelocityBrakeReveal } from "@/components/satisium-ui/velocity-brake-reveal"

export default function VelocityBrakeDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-5xl px-6 text-center">
        <VelocityBrakeReveal
          as="h1"
          text="Momentum & Friction."
          className="text-6xl leading-[1.1] font-black tracking-tighter md:text-8xl"
          splitBy="char"
          delay={0.2}
          duration={0.8}
          stagger={0.03}
          startSkew={-30}
          startX="-4em"
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const velocityBrakeRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface VelocityBrakeRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startX?: string | number
  startSkew?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const VelocityBrakeReveal = React.forwardRef<
  HTMLElement,
  VelocityBrakeRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startX = "-3em",
      startSkew = -25,
      duration = 0.9,
      delay = 0,
      stagger = 0.04,
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
          ".brake-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: startX,
              skewX: startSkew,
              opacity: 0,
            },
            {
              x: 0,
              skewX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(2.5)",
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
          startX,
          startSkew,
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
      transform: \`translateX(\${startX}) skewX(\${startSkew}deg)\`,
      transformOrigin: "bottom center",
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
        style={{ padding: "0.2em 0" }}
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
                      className="brake-item"
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
                className="brake-item"
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

VelocityBrakeReveal.displayName = "VelocityBrakeReveal"
`

export const velocityBrakeRevealFile = {
  "velocity-brake-reveal.tsx": {
    code: velocityBrakeRevealString,
    language: "tsx",
  },
}
