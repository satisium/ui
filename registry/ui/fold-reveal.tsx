"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FoldRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Text to reveal. Use \n to define the distinct folding panels (lines) */
  text: string
  /** The HTML tag to render as @default "h1" */
  as?: React.ElementType
  /** The angle the paper folds out from @default -90 */
  startAngleX?: number
  /** Duration of the fold animation per line @default 1.2 */
  duration?: number
  /** Delay before the animation begins (in seconds) @default 0 */
  delay?: number
  /** The stagger delay between each line folding down @default 0.15 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start @default "top 85%" */
  triggerStart?: string
}

/**
 * FoldReveal
 *
 * A structural text reveal component for Satis UI.
 * Distinct lines of text hinge downward into view like a cascading staircase
 * or folding paper, providing a rigid, architectural feel.
 */
export const FoldReveal = React.forwardRef<HTMLElement, FoldRevealProps>(
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
    // Typed as 'any' to safely bypass strict polymorphic DOM type constraints
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

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
              clearProps: "transform,opacity", // Restores pristine native rendering
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

        // Accessibility Failsafe for Vestibular Disorders
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

    // FOUC FIX: Set the exact 3D starting coordinates
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `rotateX(${startAngleX}deg)`,
      transformOrigin: "bottom center", // Anchored strictly to the bottom edge for the staircase effect
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const lines = text.split("\n")
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text.replace(/\n/g, " ")} // Screen reader safe formatting
        className={cn("flex flex-col text-left", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-col">
          {lines.map((line, lineIndex) => (
            <span
              key={lineIndex}
              className="block"
              // Perspective on the individual wrapper ensures uniform depth across lines
              style={{ perspective: "1200px" }}
            >
              <span
                className="fold-panel block whitespace-pre-wrap"
                style={ssrInitialStyles}
              >
                {line || "\u00A0"}
              </span>
            </span>
          ))}
        </span>
      </Component>
    )
  }
)

FoldReveal.displayName = "FoldReveal"
