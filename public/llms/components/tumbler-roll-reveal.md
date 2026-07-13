# Tumbler Roll Reveal Component Context

**Description:** A mechanical 3D text reveal component for Satis UI. Characters or words roll into place along an invisible 3D cylinder using Z-axis transform-origin math, mimicking the tactile snap of a combination lock or vintage split-flap display. Features full vestibular disorder failsafes to override the 3D transformations for accessible fading.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add tumbler-roll-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop             | Type                | Default     | Description                         |
| :--------------- | :------------------ | :---------- | :---------------------------------- |
| `text`           | `string`            | _Required_  | The text string.                    |
| `as`             | `React.ElementType` | `"h1"`      | HTML element to render.             |
| `splitBy`        | `"word" \| "char"`  | `"char"`    | Split mode.                         |
| `startAngle`     | `number`            | `110`       | Starting X-axis rotation.           |
| `cylinderRadius` | `string`            | `"-0.8em"`  | Depth of the invisible 3D cylinder. |
| `duration`       | `number`            | `0.9`       | Animation duration.                 |
| `delay`          | `number`            | `0`         | Intro delay.                        |
| `stagger`        | `number`            | `0.04`      | Stagger timing between items.       |
| `viewportOnce`   | `boolean`           | `true`      | Toggle repeating animations.        |
| `triggerStart`   | `string`            | `"top 90%"` | Scroll trigger coordinate.          |

## 3. Core Component Source

**File Path:** `components/ui/tumbler-roll-reveal.tsx`

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

export interface TumblerRollRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startAngle?: number
  cylinderRadius?: string
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const TumblerRollReveal = React.forwardRef<
  HTMLElement,
  TumblerRollRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = 110,
      cylinderRadius = "-0.8em",
      duration = 0.9,
      delay = 0,
      stagger = 0.04,
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".tumbler-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngle,
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
              clearProps: "transform,opacity",
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

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            { opacity: 0, rotateX: 0 },
            {
              opacity: 1,
              rotateX: 0,
              duration: 0.5,
              delay,
              stagger,
              ease: "none",
              clearProps: "transform,opacity",
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
          duration,
          delay,
          stagger,
          startAngle,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `rotateX(${startAngle}deg)`,
      transformOrigin: `50% 50% ${cylinderRadius}`,
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text.replace(/\n/g, " ")}
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
        style={{ perspective: "800px" }}
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
                      className="tumbler-item inline-block"
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
                key={wordIndex}
                className="tumbler-item inline-block"
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

TumblerRollReveal.displayName = "TumblerRollReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { TumblerRollReveal } from "@/components/ui/tumbler-roll-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <TumblerRollReveal
        as="h1"
        text="Winter is coming !!!"
        className="text-6xl font-bold"
        splitBy="char"
        delay={0.2}
        duration={0.9}
        stagger={0.02}
      />
    </main>
  )
}
```
