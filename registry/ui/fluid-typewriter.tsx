"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface FluidTypewriterProps extends React.HTMLAttributes<HTMLElement> {
  /** The full string of text to type out. Supports wrapping. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Tailwind class for the blinking cursor. @default "bg-primary" */
  cursorClassName?: string
  /** Push the cursor slightly down to account for descenders. @default "0.1em" */
  cursorYOffset?: string | number
  /** Speed of the cursor glide per character in seconds. @default 0.02 */
  baseSpeed?: number
  /** Human variance applied to the typing speed for realism. @default 0.02 */
  variance?: number
  /** Delay before the typewriter begins (in seconds). @default 0 */
  delay?: number
  /** If true, animates only once. Recommended to avoid reverse-deletion. @default true */
  viewportOnce?: boolean
  /** Viewport threshold for when the animation should start. @default "top 90%" */
  triggerStart?: string
}

/**
 * FluidTypewriter
 *
 * A liquid-smooth typewriter effect for Satisium UI.
 * A glowing cursor seamlessly glides across the text, intelligently wrapping
 * to new lines and pausing at punctuation, while characters emerge from a deep blur.
 *
 * @example
 * ```tsx
 * import { FluidTypewriter } from "@/components/satisium-ui/fluid-typewriter"
 *
 * export default function Hero() {
 *   return (
 *     <FluidTypewriter
 *       as="h1"
 *       text="Seamless fluidity."
 *       baseSpeed={0.04}
 *       cursorClassName="bg-blue-500"
 *     />
 *   )
 * }
 * ```
 */
export const FluidTypewriter = React.forwardRef<
  HTMLElement,
  FluidTypewriterProps
>(
  (
    {
      text,
      as = "h1",
      className,
      cursorClassName = "bg-primary",
      cursorYOffset = "0.1em",
      baseSpeed = 0.02,
      variance = 0.02,
      delay = 0,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' to securely bypass React polymorphic type constraints
    const containerRef = React.useRef<any>(null)
    const cursorRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !cursorRef.current) return

        const charElements = gsap.utils.toArray<HTMLElement>(
          ".fluid-char",
          containerRef.current
        )
        if (charElements.length === 0) return

        let tl: gsap.core.Timeline

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // 1. Setup the soft breathing cursor
          const cursorBlink = gsap.fromTo(
            cursorRef.current,
            { opacity: 1 },
            {
              opacity: 0,
              duration: 0.6,
              ease: "power2.inOut",
              repeat: -1,
              yoyo: true,
            }
          )
          cursorBlink.pause()

          tl = gsap.timeline({
            delay: delay,
            scrollTrigger: {
              trigger: containerRef.current,
              start: triggerStart,
              once: viewportOnce,
              toggleActions: viewportOnce
                ? "play none none none"
                : "play none none reverse",
            },
            onStart: () => {
              gsap.set(cursorRef.current, {
                x: charElements[0].offsetLeft,
                y: charElements[0].offsetTop,
                opacity: 1,
                display: "inline-block",
              })
            },
            onComplete: () => {
              cursorBlink.play()
            },
          })

          let timePos = 0

          charElements.forEach((charNode, i) => {
            const charText = charNode.getAttribute("data-char") || ""
            const isLast = i === charElements.length - 1

            // 2. Liquid Glide Math
            let nextX, nextY
            if (isLast) {
              nextX = charNode.offsetLeft + charNode.offsetWidth
              nextY = charNode.offsetTop
            } else {
              nextX = charElements[i + 1].offsetLeft
              nextY = charElements[i + 1].offsetTop
            }

            const isLineBreak = nextY > charNode.offsetTop + 5
            let duration = baseSpeed + Math.random() * variance

            if (isLineBreak) {
              duration = 0.15 // Fast diagonal zip for line breaks
            } else if (charText === " ") {
              duration = baseSpeed * 1.5 // Micro-hesitation on spaces
            }

            // Glide the cursor
            tl.to(
              cursorRef.current,
              {
                x: nextX,
                y: nextY,
                duration: duration,
                ease: isLineBreak ? "power2.inOut" : "none",
              },
              timePos
            )

            // 3. The Void Reveal (Deep blur to sharp focus)
            tl.to(
              charNode,
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.4,
                ease: "power2.out",
                // ABSOLUTE QUALITY FIX: Removes the filter property entirely upon completion,
                // restoring flawless native sub-pixel anti-aliasing.
                clearProps: "filter",
              },
              timePos
            )

            timePos += duration

            // Human breath pause at punctuation
            if (/[.,!?]/.test(charText)) {
              timePos += 0.25
            }
          })

          // Resize Handler: Prevents the cursor from detaching into space if the window
          // is resized, causing the absolute offsets baked into the timeline to misalign.
          const handleResize = () => {
            if (!containerRef.current || !cursorRef.current) return

            if (tl.progress() > 0 && tl.progress() < 1) {
              tl.progress(1)
            }

            const last = charElements[charElements.length - 1]
            if (last) {
              gsap.set(cursorRef.current, {
                x: last.offsetLeft + last.offsetWidth,
                y: last.offsetTop,
              })
            }
          }

          window.addEventListener("resize", handleResize)
          return () => window.removeEventListener("resize", handleResize)
        })

        // Accessibility Failsafe for Vestibular Disorders
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(cursorRef.current, { display: "none" })

          gsap.fromTo(
            charElements,
            { opacity: 0, filter: "none" },
            {
              opacity: 1,
              duration: 0.5,
              stagger: 0.02,
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
        dependencies: [baseSpeed, variance, delay, triggerStart, viewportOnce],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      filter: "blur(8px)",
      willChange: "opacity, filter",
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
        <span aria-hidden="true">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
              return (
                <span
                  key={wordIndex}
                  className="fluid-char inline-block whitespace-pre"
                  data-char={word}
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              )
            }

            return (
              <span key={wordIndex} className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => (
                  <span
                    key={`${wordIndex}-${charIndex}`}
                    className="fluid-char inline-block"
                    data-char={char}
                    style={ssrInitialStyles}
                  >
                    {char}
                  </span>
                ))}
              </span>
            )
          })}
        </span>

        {/* The Cursor */}
        <span
          ref={cursorRef}
          className={cn(
            "absolute top-0 left-0 z-10 hidden rounded-[1px] will-change-transform",
            "h-[1.2em] w-[0.12em]", // 1.2em height frames uppercase letters perfectly
            cursorClassName
          )}
          style={{ marginTop: cursorYOffset }}
        />
      </Component>
    )
  }
)

FluidTypewriter.displayName = "FluidTypewriter"
