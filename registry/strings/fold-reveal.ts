export const foldRevealDemoString = `
import { FoldReveal } from "@/components/satisium-ui/fold-reveal"

export default function FoldRevealDemo() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <FoldReveal
          as="h1"
          text={"Architecture in \\ndigital motion."}
          className="text-5xl leading-[0.9] font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[8rem]"
          delay={0.2}
          duration={1.4}
          stagger={0.2}
          viewportOnce={true}
        />
      </div>
    </main>
  )
}
`

export const foldRevealString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FoldRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  startAngleX?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const FoldReveal = React.forwardRef<
  HTMLElement,
  FoldRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      startAngleX = -90,
      duration = 1.2,
      delay = 0,
      stagger = 0.15,
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
          ".fold-panel",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngleX,
              opacity: 0,
            },
            {
              rotateX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(1.2)",
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
          duration,
          delay,
          stagger,
          startAngleX,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: \`rotateX(\${startAngleX}deg)\`,
      transformOrigin: "bottom center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const lines = text.split("\\n")
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text.replace(/\\n/g, " ")}
        className={cn("flex flex-col text-left", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-col">
          {lines.map((line, lineIndex) => (
            <span
              key={lineIndex}
              className="block"
              style={{ perspective: "1200px" }}
            >
              <span
                className="fold-panel block whitespace-pre-wrap"
                style={ssrInitialStyles}
              >
                {line || "\\u00A0"}
              </span>
            </span>
          ))}
        </span>
      </Component>
    )
  }
)

FoldReveal.displayName = "FoldReveal"
`

export const foldRevealFile = {
  "fold-reveal.tsx": {
    code: foldRevealString,
    language: "tsx",
  },
}
