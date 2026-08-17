"use client" // CRITICAL for animation and function props

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface PianoTypewriterProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  cursorClassName?: string
  baseSpeed?: number
  variance?: number
  delay?: number
  viewportOnce?: boolean
  triggerStart?: string
  onComplete?: () => void
}

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
      baseSpeed = 0.08, // Slowed down to human reading/typing speed
      variance = 0.04, // Human imperfection in typing rhythm
      delay = 0.5,
      viewportOnce = true,
      triggerStart = "top 90%",
      onComplete,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    const cursorRef = React.useRef<HTMLSpanElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current || !cursorRef.current) return

        const charContainers = gsap.utils.toArray<HTMLElement>(
          ".piano-char-container",
          containerRef.current
        )
        if (charContainers.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          // 1. Initial State
          gsap.set(cursorRef.current, {
            x: charContainers[0].offsetLeft,
            y: charContainers[0].offsetTop,
            opacity: 1,
            display: "inline-block",
          })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: triggerStart,
              once: viewportOnce,
            },
          })

          let timePos = delay

          // 2. The Anticipation (Blink Exactly Twice)
          const blinkSpeed = 0.35
          for (let i = 0; i < 2; i++) {
            tl.to(
              cursorRef.current,
              { opacity: 0, duration: blinkSpeed, ease: "power1.inOut" },
              timePos
            )
            timePos += blinkSpeed
            tl.to(
              cursorRef.current,
              { opacity: 1, duration: blinkSpeed, ease: "power1.inOut" },
              timePos
            )
            timePos += blinkSpeed
          }

          // A tiny breath before typing begins
          timePos += 0.2

          // 3. The Human Typing Sequence
          charContainers.forEach((container, i) => {
            const charText = container.getAttribute("data-char") || ""
            const isLast = i === charContainers.length - 1

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

            if (isLineBreak) duration = 0.2
            else if (charText === " ") duration = baseSpeed * 1.8 // Longer pause for spaces

            // Move Cursor
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

            // Reveal Character
            const visibleChar = container.querySelector(".piano-visible")
            if (visibleChar) {
              tl.fromTo(
                visibleChar,
                { opacity: 0, rotateX: -60, y: 15, scale: 0.8 },
                {
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  scale: 1,
                  duration: 0.8,
                  ease: "back.out(2.5)",
                  force3D: true,
                  clearProps: "transform,scale,opacity",
                },
                timePos
              )
            }

            timePos += duration
            if (/[.,!?]/.test(charText)) timePos += 0.3 // Pause on punctuation
          })

          // 4. The Catalyst (Wait, Blink Once, Trigger)
          timePos += 0.3 // Human pause after finishing typing

          tl.to(
            cursorRef.current,
            { opacity: 0, duration: 0.4, ease: "power1.inOut" },
            timePos
          )
          timePos += 0.4
          tl.to(
            cursorRef.current,
            { opacity: 1, duration: 0.4, ease: "power1.inOut" },
            timePos
          )
          timePos += 0.4

          // Fire the callback to the Hero component to start the morph
          tl.add(() => {
            if (onComplete) onComplete()
          }, timePos)

          // 5. The Fade Out (Smoothly disappear as the morph happens)
          tl.to(
            cursorRef.current,
            { opacity: 0, duration: 1.0, ease: "power2.out" },
            timePos + 0.2
          )

          const handleResize = () => {
            if (!containerRef.current || !cursorRef.current) return
            if (tl.progress() > 0 && tl.progress() < 1) tl.progress(1)

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

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(cursorRef.current, { display: "none" })
          const visibleChars = gsap.utils.toArray(
            ".piano-visible",
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
              onComplete: () => {
                if (onComplete) onComplete()
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
      transform: "translateY(15px) rotateX(-60deg) scale(0.8)",
      transformOrigin: "bottom center",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        style={{ perspective: "800px", padding: "0.2em 0" }}
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
                    <span className="invisible [grid-area:stack]">{char}</span>
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
