export const bottomHingeTextRevealDemoString = `
import { BottomHingeTextReveal } from "@/components/satisium-ui/bottom-hinge-text-reveal"

export default function BottomHingeTextRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="px-6 text-center">
        <BottomHingeTextReveal
          as="h1"
          text="Hard impact."
          className="text-6xl leading-[1] font-bold tracking-tighter md:text-9xl"
          splitBy="char"
          delay={0.2}
          duration={2}
          stagger={0.06}
        />
      </div>
    </main>
  )
}
`

export const bottomHingeTextRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface BottomHingeTextRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startZ?: string | number
  startAngleX?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const BottomHingeTextReveal = React.forwardRef<
  HTMLElement,
  BottomHingeTextRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startZ = "-400px",
      startAngleX = -70,
      duration = 0.7,
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

    const resolveZ = typeof startZ === "number" ? \`\${startZ}px\` : startZ

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".hinge-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              z: resolveZ,
              rotateX: startAngleX,
              opacity: 0,
            },
            {
              z: 0,
              rotateX: 0,
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
          resolveZ,
          startAngleX,
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
      transform: \`translateZ(\${resolveZ}) rotateX(\${startAngleX}deg)\`,
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
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        style={{ perspective: "600px" }}
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
                      className="hinge-item inline-block"
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
                className="hinge-item inline-block"
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

BottomHingeTextReveal.displayName = "BottomHingeTextReveal"
`

export const bottomHingeTextRevealFile = {
  "bottom-hinge-text-reveal.tsx": {
    code: bottomHingeTextRevealString,
    language: "tsx",
  },
}
