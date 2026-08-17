"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface BottomHingeTextRevealProps extends React.HTMLAttributes<HTMLElement> {
  /** The text to reveal. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Whether to split and animate by "word" or individual "char". @default "char" */
  splitBy?: "word" | "char"
  /** How deep into the screen the element starts. @default "-400px" */
  startZ?: string | number
  /** The starting backward tilt of the element. @default -70 */
  startAngleX?: number
  /** Duration of the snap animation. @default 0.7 */
  duration?: number
  /** Delay before the animation begins (in seconds). @default 0 */
  delay?: number
  /** Stagger delay between each element slamming into place. @default 0.04 */
  stagger?: number
  /** If true, plays once. If false, seamlessly reverses on scroll away. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * BottomHingeTextReveal
 *
 * A high-impact 3D text reveal component for Satisium UI.
 * Elements start deep in the Z-axis, leaning backward, and aggressively
 * swing up and slam into place using a tight perspective and heavy overshoot.
 *
 * @example
 * ```tsx
 * import { BottomHingeTextReveal } from "@/components/satisium-ui/bottom-hinge-text-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <BottomHingeTextReveal
 *       as="h1"
 *       text="Hard impact."
 *       splitBy="char"
 *     />
 *   )
 * }
 * ```
 */
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
      startAngleX = -70, // Leaning heavily backward, ready to swing up
      duration = 0.7, // Fast and snappy
      delay = 0,
      stagger = 0.04, // Rapid sequence
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to safely bypass strict polymorphic DOM type constraints
    const containerRef = React.useRef<HTMLElement | null>(null)
    React.useImperativeHandle(ref, () => containerRef.current!)

    const resolveZ = typeof startZ === "number" ? `${startZ}px` : startZ

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
              // back.out(2.5) provides a massive overshoot.
              // It simulates the character swinging up, slamming into place, and rebounding instantly.
              ease: "back.out(2.5)",
              force3D: true,
              clearProps: "transform,opacity", // Strips inline 3D styles after animation to restore pristine native rendering
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

    // FOUC FIX: Inject initial 3D transform state to hide elements before JS executes
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateZ(${resolveZ}) rotateX(${startAngleX}deg)`,
      transformOrigin: "bottom center", // Hinges from the base of the element
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader safe
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        // 600px is a very tight perspective. It creates a "fisheye" 3D effect,
        // making the Z-axis travel look extremely fast and dramatic.
        style={{ perspective: "600px" }}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
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
                      key={`${wordIndex}-${charIndex}`}
                      className="hinge-item inline-block"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              )
            }

            // Default: Split by Word
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
