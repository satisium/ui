import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface EditorialRevealProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The full string of text to reveal.
   * Automatically splits by words and preserves native whitespace wrapping.
   */
  text: string
  /**
   * The HTML tag to render as (e.g., 'h1', 'h2', 'p', 'span').
   * @default "p"
   */
  as?: React.ElementType
  /**
   * Tailwind class for the redaction block color.
   * Matches standard shadcn/ui theme variables.
   * @default "bg-foreground"
   */
  blockClassName?: string
  /**
   * Viewport threshold for when the animation should start.
   * Format: "[element point] [viewport point]"
   * @default "top 85%"
   */
  triggerStart?: string
  /**
   * The duration of the reveal for each individual block in seconds.
   * @default 0.5
   */
  duration?: number
  /**
   * The stagger delay between each word revealing in seconds.
   * @default 0.015
   */
  stagger?: number
  /**
   * GSAP easing function for the scale animation.
   * @default "power3.in" (Starts slow, finishes fast for a snappy reveal)
   */
  ease?: string
  /**
   * Whether the blocks should close again when scrolling back up.
   * @default true
   */
  reverseOnScroll?: boolean
}

/**
 * EditorialReveal
 *
 * A premium, Awwwards-level text reveal component for Satisium UI.
 * Uses GSAP and ScrollTrigger to create a sophisticated, staggered redaction-block reveal
 * that triggers exactly when the text enters the viewport.
 *
 * @example
 * ```tsx
 * import { EditorialReveal } from "@/components/satisium-ui/editorial-reveal"
 *
 * export default function Hero() {
 *   return (
 *     <EditorialReveal
 *       as="h2"
 *       text="Meticulously crafted components for modern web applications."
 *       blockClassName="bg-primary rounded-[2px]"
 *       duration={0.6}
 *       stagger={0.02}
 *     />
 *   )
 * }
 * ```
 */
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
    // Typed as 'any' internally to bypass strict polymorphic DOM type constraints
    // without sacrificing outer type safety or cluttering intellisense.
    const containerRef = React.useRef<HTMLElement | null>(null)

    // Securely forward the internal ref out to the consumer
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
          // ScrollTrigger.batch guarantees words line-by-line reveal fully
          // without getting "stuck" halfway if the user pauses scrolling.
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

        // Accessibility Failsafe for Vestibular Disorders (Simple Fade instead of motion)
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

    // Strictly prevents FOUC (Flash of Unstyled Content).
    // The blocks must be fully scaled on server render to hide the text initially.
    // transform-origin: right ensures it collapses towards the right.
    const ssrBlockStyles: React.CSSProperties = {
      transform: "scaleX(1)",
      transformOrigin: "right center",
      willChange: "transform",
    }

    // Safely split by whitespace to let the browser natively handle flex/grid wrapping
    const words = text.split(/(\s+)/)

    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader reads the whole text cleanly at once
        className={cn("relative m-0 whitespace-pre-wrap", className)}
        {...props}
      >
        {/* aria-hidden hides the fragmented spans from screen readers */}
        <span aria-hidden="true">
          {words.map((word, i) => {
            if (word.match(/\s+/)) {
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
