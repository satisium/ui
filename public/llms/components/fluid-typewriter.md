# Fluid Typewriter Component Context

**Description:** A liquid-smooth typewriter effect for Satis UI. A glowing cursor seamlessly glides across the text, intelligently wrapping to new lines and pausing at punctuation, while characters emerge from a deep blur. Includes robust window resize calculation and clearProps filtering for pristine anti-aliasing.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/fluid-typewriter.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                | Default        | Description                                 |
| :---------------- | :------------------ | :------------- | :------------------------------------------ |
| `text`            | `string`            | _Required_     | The text string.                            |
| `as`              | `React.ElementType` | `"h1"`         | HTML element to render.                     |
| `cursorClassName` | `string`            | `"bg-primary"` | Classes for the cursor.                     |
| `cursorYOffset`   | `string \| number`  | `"0.1em"`      | Downward offset.                            |
| `baseSpeed`       | `number`            | `0.02`         | Gliding speed base (seconds).               |
| `variance`        | `number`            | `0.02`         | Random speed variance for realistic typing. |
| `delay`           | `number`            | `0`            | Intro delay.                                |
| `viewportOnce`    | `boolean`           | `true`         | Toggle repeating animations.                |
| `triggerStart`    | `string`            | `"top 90%"`    | Scroll trigger coordinate.                  |

## 3. Core Component Source

**File Path:** `components/ui/fluid-typewriter.tsx`

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

export interface FluidTypewriterProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  cursorClassName?: string
  cursorYOffset?: string | number
  baseSpeed?: number
  variance?: number
  delay?: number
  viewportOnce?: boolean
  triggerStart?: string
}

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
              duration = 0.15
            } else if (charText === " ") {
              duration = baseSpeed * 1.5
            }

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

            tl.to(
              charNode,
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.4,
                ease: "power2.out",
                clearProps: "filter",
              },
              timePos
            )

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

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true">
          {words.map((word, wordIndex) => {
            if (word.match(/\\s+/)) {
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
                    key={\`\${wordIndex}-\${charIndex}\`}
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

        <span
          ref={cursorRef}
          className={cn(
            "absolute top-0 left-0 z-10 hidden rounded-[1px] will-change-transform",
            "h-[1.2em] w-[0.12em]",
            cursorClassName
          )}
          style={{ marginTop: cursorYOffset }}
        />
      </Component>
    )
  }
)

FluidTypewriter.displayName = "FluidTypewriter"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { FluidTypewriter } from "@/components/ui/fluid-typewriter"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <div className="max-w-2xl px-6">
        <FluidTypewriter
          as="h1"
          text="Seamless fluidity."
          className="text-6xl font-bold tracking-tight"
          baseSpeed={0.04}
          cursorClassName="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        />
      </div>
    </main>
  )
}
```
