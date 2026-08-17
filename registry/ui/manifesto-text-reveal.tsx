"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ManifestoTextRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text string to animate */
  text: string
  /** The HTML element to render as @default "p" */
  as?: React.ElementType
  /**
   * If false, plays once when triggered.
   * If a number, ties to scroll with that many seconds of momentum/inertia.
   * @default 1
   */
  scrub?: boolean | number
  /** Whether to animate word-by-word or character-by-character @default "word" */
  splitLevel?: "word" | "character"
  /** The opacity of the text before it fills in @default 0.2 */
  inactiveOpacity?: number
  /** GSAP ScrollTrigger start point @default "top 80%" */
  triggerStart?: string
  /** GSAP ScrollTrigger end point @default "bottom 50%" */
  triggerEnd?: string
  /** If true, pins the text in place while revealing (Apple-style scrollytelling) @default false */
  pin?: boolean
}

/**
 * ManifestoTextReveal
 *
 * A premium scrollytelling text reveal component for Satisium UI.
 * Fades text in word-by-word or character-by-character, utilizing scroll momentum
 * and optional DOM pinning to create a cinematic reading experience.
 *
 * @example
 * ```tsx
 * import { ManifestoTextReveal } from "@/components/satisium-ui/manifesto-text-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <ManifestoTextReveal
 *       as="h2"
 *       text="Clarity is the ultimate luxury."
 *       splitLevel="word"
 *       scrub={1.2}
 *       pin={true}
 *     />
 *   )
 * }
 * ```
 */
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
    // Typed as 'any' to securely bypass polymorphic DOM type constraints
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    // Safety fallback: if a user explicitly passes `true`, convert it to `1` for the momentum fix
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
            // SCRUB MODE: Fluidly tied to scrollbar with inertia
            gsap.fromTo(
              targets,
              { opacity: inactiveOpacity },
              {
                opacity: 1,
                stagger: 0.1, // Overlaps the fill effect for fluid motion
                ease: "none", // Linear easing is best for scroll-scrubbing
                scrollTrigger: {
                  trigger: containerRef.current,
                  pin: pin, // Locks the text on screen if true
                  start: triggerStart,
                  end: triggerEnd,
                  scrub: scrubValue, // The liquid momentum value
                },
              }
            )
          } else {
            // TRIGGER MODE: Plays a cinematic stagger once it enters view
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
                // ABSOLUTE QUALITY FIX: Removes filter to restore native sub-pixel font rendering
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

        // Accessibility Failsafe for Vestibular Disorders
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

    // Dynamic FOUC prevention based on mode
    const ssrInitialStyles: React.CSSProperties = isScrubbing
      ? {
          opacity: inactiveOpacity,
          willChange: "opacity",
        }
      : {
          opacity: inactiveOpacity,
          transform: "translateY(8px)",
          filter: "blur(4px)",
          willChange: "opacity, transform, filter",
        }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader safe
        className={cn("relative text-left whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIdx) => {
            if (word.match(/\s+/)) {
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
                      key={`${wordIdx}-${charIdx}`}
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
