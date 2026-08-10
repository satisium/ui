# Elastic Typewriter Component Context

**Description:** A highly kinetic typewriter effect for Satis UI. A cursor glides across the text, while individual characters stretch, squeeze, skew, and elastic-snap into place to simulate mechanical physical tension. Features robust window resizing recalculations and screen reader support.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add elastic-typewriter
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                | Default        | Description                                 |
| :---------------- | :------------------ | :------------- | :------------------------------------------ |
| `text`            | `string`            | _Required_     | The text string.                            |
| `as`              | `React.ElementType` | `"h1"`         | HTML element to render.                     |
| `cursorClassName` | `string`            | `"bg-primary"` | Classes for the cursor.                     |
| `baseSpeed`       | `number`            | `0.04`         | Gliding speed base (seconds).               |
| `variance`        | `number`            | `0.02`         | Random speed variance for realistic typing. |
| `delay`           | `number`            | `0`            | Intro delay.                                |
| `viewportOnce`    | `boolean`           | `true`         | Toggle repeating animations.                |
| `triggerStart`    | `string`            | `"top 90%"`    | Scroll trigger coordinate.                  |

## 3. Core Component Source

**File Path:** `components/ui/elastic-typewriter.tsx`

```tsx
"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ElasticTypewriterProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  cursorClassName?: string
  baseSpeed?: number
  variance?: number
  delay?: number
  viewportOnce?: boolean
  triggerStart?: string
}

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

            if (isLineBreak) duration = 0.15
            else if (charText === " ") duration = baseSpeed * 1.5

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
                  duration: 1.2,
                  ease: "elastic.out(1, 0.3)",
                  force3D: true,
                },
                timePos
              )
            }

            timePos += duration

            if (/[.,!?]/.test(charText)) {
              timePos += 0.25
            }
          })

          const handleResize = () => {
            if (!containerRef.current || !cursorRef.current) return

            if (tl.progress() > 0 && tl.progress() < 1) {
              tl.progress(1)
            }

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

          const visibleChars = gsap.utils.toArray(".elastic-visible", containerRef.current)

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

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: "translateY(20px) scaleY(1.5) scaleX(0.7) skewX(-20deg)",
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
        style={{ padding: "0.2em 0" }}
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
                    <span className="invisible [grid-area:stack]">{char}</span>

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
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { ElasticTypewriter } from "@/components/ui/elastic-typewriter"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <ElasticTypewriter
        as="h1"
        text="Tension & elasticity."
        className="text-6xl font-bold"
        baseSpeed={0.05}
        cursorClassName="bg-blue-500"
      />
    </main>
  )
}
```
