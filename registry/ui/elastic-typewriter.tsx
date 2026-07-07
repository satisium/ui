"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ElasticTypewriterProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The full string of text to type out.
   * Supports natural wrapping and spaces.
   */
  text: string
  /**
   * The HTML tag to render as.
   * @default "h1"
   */
  as?: React.ElementType
  /**
   * Tailwind class for the blinking cursor.
   * @default "bg-primary"
   */
  cursorClassName?: string
  /**
   * Speed of the cursor glide per character in seconds.
   * @default 0.04
   */
  baseSpeed?: number
  /**
   * Human variance applied to the typing speed for realism.
   * @default 0.02
   */
  variance?: number
  /**
   * Delay before the typewriter begins (in seconds).
   * @default 0
   */
  delay?: number
  /**
   * If true, animates only once. Highly recommended for typewriters to avoid awkward reverse-deletions.
   * @default true
   */
  viewportOnce?: boolean
  /**
   * Viewport threshold for when the animation should start.
   * @default "top 90%"
   */
  triggerStart?: string
}

/**
 * ElasticTypewriter
 *
 * A highly kinetic typewriter effect for Satis UI.
 * A cursor glides across the text, while individual characters stretch, squeeze,
 * skew, and elastic-snap into place to simulate mechanical physical tension.
 *
 * @example
 * ```tsx
 * import { ElasticTypewriter } from "@/components/ui/elastic-typewriter"
 *
 * export default function Hero() {
 *   return (
 *     <ElasticTypewriter
 *       as="h1"
 *       text="Mechanical precision."
 *       baseSpeed={0.05}
 *       cursorClassName="bg-blue-500"
 *     />
 *   )
 * }
 * ```
 */
export const ElasticTypewriter = React.forwardRef<
  HTMLElement,
  ElasticTypewriterProps
>(
  (
    {
      text,
      as = "h1",
      className,
      cursorClassName = "bg-primary",
      baseSpeed = 0.04,
      variance = 0.02,
      delay = 0,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    // Typed as 'any' internally to safely bypass polymorphic React constraint errors
    const containerRef = React.useRef<any>(null)
    const cursorRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !cursorRef.current) return

        const charContainers = gsap.utils.toArray<HTMLElement>(
          ".elastic-char-container",
          containerRef.current
        )
        if (charContainers.length === 0) return

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
                x: charContainers[0].offsetLeft,
                y: charContainers[0].offsetTop,
                opacity: 1,
                display: "inline-block",
              })
            },
            onComplete: () => {
              cursorBlink.play()
            },
          })

          let timePos = 0

          charContainers.forEach((container, i) => {
            const charText = container.getAttribute("data-char") || ""
            const isLast = i === charContainers.length - 1

            // 2. Liquid Glide Math
            let nextX, nextY
            if (isLast) {
              nextX = container.offsetLeft + container.offsetWidth
              nextY = container.offsetTop
            } else {
              nextX = charContainers[i + 1].offsetLeft
              nextY = charContainers[i + 1].offsetTop
            }

            const isLineBreak = nextY > container.offsetTop + 5
            let duration = baseSpeed + Math.random() * variance

            if (isLineBreak)
              duration = 0.15 // Smooth diagonal carriage return
            else if (charText === " ") duration = baseSpeed * 1.5 // Spacebar hesitation

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

            const visibleChar = container.querySelector(".elastic-visible")

            if (visibleChar) {
              // 3. The Elastic Rubberband Math:
              // Character is stretched, squeezed, and skewed towards the cursor, snapping rigid on release.
              tl.fromTo(
                visibleChar,
                {
                  opacity: 0,
                  y: 20,
                  scaleY: 1.5,
                  scaleX: 0.7,
                  skewX: -20,
                },
                {
                  opacity: 1,
                  y: 0,
                  scaleY: 1,
                  scaleX: 1,
                  skewX: 0,
                  duration: 1.2, // Long decay for the rubber-band wobble
                  ease: "elastic.out(1, 0.3)", // Tension release physics
                  force3D: true,
                },
                timePos
              )
            }

            timePos += duration

            // Human breath pause on punctuation
            if (/[.,!?]/.test(charText)) {
              timePos += 0.25
            }
          })

          // Resize Handler: Prevents the cursor from detaching into space if the window
          // is resized, causing the absolute offsets baked into the timeline to misalign.
          const handleResize = () => {
            if (!containerRef.current || !cursorRef.current) return

            // Instantly jump to the end of the timeline if resized midway
            if (tl.progress() > 0 && tl.progress() < 1) {
              tl.progress(1)
            }

            // Recalculate final resting position
            const last = charContainers[charContainers.length - 1]
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

        // Accessibility: Vestibular Disorder Failsafe
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(cursorRef.current, { display: "none" }) // Hide cursor

          const visibleChars = gsap.utils.toArray(
            ".elastic-visible",
            containerRef.current
          )

          gsap.fromTo(
            visibleChars,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              stagger: 0.02,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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

    // FOUC Prevention
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: "translateY(20px) scaleY(1.5) scaleX(0.7) skewX(-20deg)",
      transformOrigin: "bottom center", // Hinges from the base of the letter
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        style={{ padding: "0.2em 0" }} // Buffer prevents the stretched letters from clipping
        {...props}
      >
        <span aria-hidden="true">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
              return (
                <span
                  key={wordIndex}
                  className="elastic-char-container inline-block whitespace-pre"
                  data-char={word}
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
                    className="elastic-char-container inline-grid items-baseline justify-items-center [grid-template-areas:'stack']"
                    data-char={char}
                  >
                    {/* LAYER 1: The Anchor (Invisible, locks layout width to prevent layout jitter) */}
                    <span className="invisible [grid-area:stack]">{char}</span>

                    {/* LAYER 2: The Stretchy Key (Animates inside the anchor space) */}
                    <span
                      className="elastic-visible [grid-area:stack]"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
                  </span>
                ))}
              </span>
            )
          })}
        </span>

        {/* The Gliding Cursor */}
        <span
          ref={cursorRef}
          className={cn(
            "absolute top-0 left-0 z-10 hidden rounded-[1px] will-change-transform",
            "mt-[0.05em] h-[1.15em] w-[0.1em]",
            cursorClassName
          )}
        />
      </Component>
    )
  }
)

ElasticTypewriter.displayName = "ElasticTypewriter"
