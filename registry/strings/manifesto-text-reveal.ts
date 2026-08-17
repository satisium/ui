export const manifestoTextRevealDemoString = `
import { ManifestoTextReveal } from "@/components/satisium-ui/manifesto-text-reveal"

export default function ManifestoTextRevealDemo() {
  return (
    <main className="relative w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <section className="flex h-screen w-full flex-col items-center justify-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll slowly</span>
        <div className="h-16 w-[1px] bg-border" />
      </section>

      <section className="flex w-full items-center justify-center px-6">
        <div className="max-w-5xl text-left md:text-justify">
          <ManifestoTextReveal
            as="h2"
            text="It's like in the great stories, Mr. Frodo. The ones that really mattered. Full of darkness and danger, they were... But in the end, it's only a passing thing, this shadow. Even darkness must pass. A new day will come. And when the sun shines, it will shine out the clearer."
            className="text-4xl leading-[1.3] font-semibold tracking-tight md:text-5xl"
            splitLevel="character"
            scrub={2} 
            pin={true} 
            inactiveOpacity={0.15}
            triggerStart="center center"
            triggerEnd="+=150%"
          />
        </div>
      </section>

      <section className="flex h-screen w-full flex-col items-center justify-center text-sm font-medium tracking-wide text-muted-foreground">
        <p>The end</p>
      </section>
    </main>
  )
}
`

export const manifestoTextRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ManifestoTextRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  scrub?: boolean | number
  splitLevel?: "word" | "character"
  inactiveOpacity?: number
  triggerStart?: string
  triggerEnd?: string
  pin?: boolean
}

export const ManifestoTextReveal = React.forwardRef<
  HTMLElement,
  ManifestoTextRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      scrub = 1,
      splitLevel = "word",
      inactiveOpacity = 0.2,
      triggerStart = "top 80%",
      triggerEnd = "bottom 50%",
      pin = false,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    const scrubValue = scrub === true ? 1 : scrub
    const isScrubbing = scrub !== false

    useGSAP(
      () => {
        if (!containerRef.current) return

        const targets = gsap.utils.toArray<HTMLElement>(
          ".manifesto-target",
          containerRef.current
        )

        if (targets.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          if (isScrubbing) {
            gsap.fromTo(
              targets,
              { opacity: inactiveOpacity },
              {
                opacity: 1,
                stagger: 0.1,
                ease: "none",
                scrollTrigger: {
                  trigger: containerRef.current,
                  pin: pin,
                  start: triggerStart,
                  end: triggerEnd,
                  scrub: scrubValue,
                },
              }
            )
          } else {
            gsap.fromTo(
              targets,
              { opacity: inactiveOpacity, y: 8, filter: "blur(4px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: splitLevel === "character" ? 0.02 : 0.04,
                duration: 0.8,
                ease: "power3.out",
                clearProps: "filter,transform",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: triggerStart,
                  once: true,
                },
              }
            )
          }
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            targets,
            { opacity: inactiveOpacity },
            {
              opacity: 1,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                pin: pin,
                start: triggerStart,
                end: isScrubbing ? triggerEnd : undefined,
                scrub: isScrubbing ? scrubValue : false,
                once: !isScrubbing,
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [
          scrub,
          scrubValue,
          isScrubbing,
          splitLevel,
          inactiveOpacity,
          triggerStart,
          triggerEnd,
          pin,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = isScrubbing
      ? { opacity: inactiveOpacity, willChange: "opacity" }
      : {
          opacity: inactiveOpacity,
          transform: "translateY(8px)",
          filter: "blur(4px)",
          willChange: "opacity, transform, filter",
        }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIdx) => {
            if (word.match(/\\s+/)) {
              return (
                <span key={wordIdx} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            if (splitLevel === "character") {
              return (
                <span key={wordIdx} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, charIdx) => (
                    <span
                      key={\`\${wordIdx}-\${charIdx}\`}
                      className="manifesto-target inline-block"
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
                className="manifesto-target inline-block"
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

ManifestoTextReveal.displayName = "ManifestoTextReveal"
`

export const manifestoTextRevealFile = {
  "manifesto-text-reveal.tsx": {
    code: manifestoTextRevealString,
    language: "tsx",
  },
}
