export const editorialRevealDemoString = `
import { EditorialReveal } from "@/components/satisium-ui/editorial-reveal"

export default function EditorialRevealDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Scroll indicator */}
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      {/* The Reveal Container */}
      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-4xl text-left md:text-center">
          <EditorialReveal
            as="h2"
            text="Meticulously crafted components for modern web applications. Elevate your interface with uncompromising performance, accessibility, and refined design."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            blockClassName="bg-primary rounded-[2px]"
            triggerStart="top 85%"
            duration={0.6}
            stagger={0.02}
            ease="power3.in"
            reverseOnScroll={true}
          />
        </div>
      </div>
    </main>
  )
}
`

export const editorialRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface EditorialRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  blockClassName?: string
  triggerStart?: string
  duration?: number
  stagger?: number
  ease?: string
  reverseOnScroll?: boolean
}

export const EditorialReveal = React.forwardRef<
  HTMLElement,
  EditorialRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      blockClassName = "bg-foreground",
      triggerStart = "top 85%",
      duration = 0.5,
      stagger = 0.015,
      ease = "power3.in",
      reverseOnScroll = true,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const blockNodes = gsap.utils.toArray<HTMLElement>(
          ".editorial-block",
          containerRef.current
        )
        if (blockNodes.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          ScrollTrigger.batch(blockNodes, {
            start: triggerStart,
            onEnter: (batch) =>
              gsap.to(batch, {
                scaleX: 0,
                duration,
                stagger,
                ease,
                overwrite: true,
              }),
            onLeaveBack: (batch) => {
              if (reverseOnScroll) {
                gsap.to(batch, {
                  scaleX: 1,
                  duration,
                  stagger,
                  ease,
                  overwrite: true,
                })
              }
            },
          })
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          ScrollTrigger.batch(blockNodes, {
            start: triggerStart,
            onEnter: (batch) =>
              gsap.to(batch, {
                opacity: 0,
                duration,
                stagger,
                ease: "none",
                overwrite: true,
              }),
            onLeaveBack: (batch) => {
              if (reverseOnScroll) {
                gsap.to(batch, {
                  opacity: 1,
                  duration,
                  stagger,
                  ease: "none",
                  overwrite: true,
                })
              }
            },
          })
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [triggerStart, duration, stagger, ease, reverseOnScroll],
      }
    )

    const ssrBlockStyles: React.CSSProperties = {
      transform: "scaleX(1)",
      transformOrigin: "right center",
      willChange: "transform",
    }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative m-0 whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true">
          {words.map((word, i) => {
            if (word.match(/\\s+/)) {
              return (
                <span key={i} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            return (
              <span key={i} className="relative inline-block">
                <span>{word}</span>
                <span
                  className={cn(
                    "editorial-block absolute -inset-x-[0.02em] inset-y-[0.05em] z-10",
                    blockClassName
                  )}
                  style={ssrBlockStyles}
                />
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

EditorialReveal.displayName = "EditorialReveal"
`

export const editorialRevealFile = {
  "editorial-reveal.tsx": {
    code: editorialRevealString,
    language: "tsx",
  },
}
