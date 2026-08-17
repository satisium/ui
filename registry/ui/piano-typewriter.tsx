"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface PianoTypewriterProps
  extends React.HTMLAttributes<HTMLElement> {
  /** The full string of text to type out. Supports wrapping. */
  text: string
  /** The HTML tag to render as. @default "h1" */
  as?: React.ElementType
  /** Tailwind class for the blinking cursor. @default "bg-primary" */
  cursorClassName?: string
  /** Speed of the cursor glide per character in seconds. @default 0.04 */
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
 * PianoTypewriter
 * 
 * A tactile, 3D typewriter effect for Satisium UI.
 * A cursor glides across the text while individual characters spring up from the Z-axis, 
 * mimicking the physical, mechanical keystrokes of a typewriter or piano.
 * 
 * @example
 * ```tsx
 * import { PianoTypewriter } from "@/components/satisium-ui/piano-typewriter"
 * 
 * export default function Hero() {
 *   return (
 *     <PianoTypewriter 
 *       as="h1"
 *       text="Mechanical precision." 
 *       baseSpeed={0.05}
 *     />
 *   )
 * }
 * ```
 */
export const PianoTypewriter = React.forwardRef<
  HTMLElement,
  PianoTypewriterProps
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
    const containerRef = React.useRef<HTMLElement | null>(null)
    const cursorRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current!)

    useGSAP(
      () => {
        if (!containerRef.current || !cursorRef.current) return

        const charContainers = gsap.utils.toArray<HTMLElement>(
          ".piano-char-container",
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

            if (isLineBreak) duration = 0.15 // Smooth diagonal carriage return
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

            const visibleChar = container.querySelector(".piano-visible")

            if (visibleChar) {
              // 3. The Physical Keystroke Math:
              // It spawns deeply pressed into the Z-axis (rotateX: -60, scale: 0.8) and springs up
              tl.fromTo(
                visibleChar,
                { opacity: 0, rotateX: -60, y: 15, scale: 0.8 },
                {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  scale: 1,
                  duration: 0.8, // Long duration allows the spring to fully resolve
                  ease: "back.out(2.5)", // Massive overshoot creates the mechanical clack
                  force3D: true,
                  clearProps: "transform,scale,opacity", // Restores native font rendering
                },
                timePos
              )
            }

            timePos += duration

            // Human breath pause
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

        // Accessibility Failsafe for Vestibular Disorders
        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(cursorRef.current, { display: "none" }) // Hide cursor
          
          const visibleChars = gsap.utils.toArray(".piano-visible", containerRef.current)
          
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

    // FOUC Prevention
    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: "translateY(15px) rotateX(-60deg) scale(0.8)",
      transformOrigin: "bottom center", // Hinges from the base of the letter
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text} // Screen reader safe
        // perspective gives the rotateX real depth into the monitor
        className={cn("relative text-left whitespace-pre-wrap", className)}
        style={{ perspective: "800px", padding: "0.2em 0" }} // Buffer for the bouncing characters
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIndex) => {
            if (word.match(/\s+/)) {
              return (
                <span
                  key={wordIndex}
                  className="piano-char-container inline-block whitespace-pre"
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
                    className="piano-char-container inline-grid items-baseline justify-items-center [grid-template-areas:'stack']"
                    data-char={char}
                  >
                    {/* LAYER 1: The Anchor (Invisible, locks layout width to prevent jitter) */}
                    <span className="invisible [grid-area:stack]">{char}</span>

                    {/* LAYER 2: The Physical Key */}
                    <span
                      className="piano-visible [grid-area:stack]"
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

PianoTypewriter.displayName = "PianoTypewriter"