# Weightless Float Reveal Component Context

**Description:** An ambient, zero-gravity text reveal component for Satis UI. Elements drift upwards into place from randomized depths and rotations, creating an organic, weightless floating effect. Engineered with GSAP's `clearProps` cleanup, strict ARIA support, and vestibular disorder failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/weightless-float-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop               | Type                | Default        | Description                   |
| :----------------- | :------------------ | :------------- | :---------------------------- |
| `text`             | `string`            | _Required_     | The text string.              |
| `as`               | `React.ElementType` | `"h1"`         | HTML tag to render.           |
| `splitBy`          | `"word" \| "char"`  | `"char"`       | Split mode.                   |
| `startYMin`        | `number`            | `40`           | Min starting Y offset.        |
| `startYMax`        | `number`            | `80`           | Max starting Y offset.        |
| `startRotationMin` | `number`            | `-8`           | Min starting tilt.            |
| `startRotationMax` | `number`            | `8`            | Max starting tilt.            |
| `duration`         | `number`            | `2.5`          | Animation duration.           |
| `delay`            | `number`            | `0`            | Intro delay.                  |
| `stagger`          | `number`            | `0.06`         | Stagger timing between items. |
| `ease`             | `string`            | `"power3.out"` | Easing curve.                 |
| `viewportOnce`     | `boolean`           | `true`         | Toggle repeating animations.  |
| `triggerStart`     | `string`            | `"top 85%"`    | Scroll trigger coordinate.    |

## 3. Core Component Source

**File Path:** `registry/ui/weightless-float-reveal.tsx`

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

export interface WeightlessFloatRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startYMin?: number
  startYMax?: number
  startRotationMin?: number
  startRotationMax?: number
  duration?: number
  delay?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const WeightlessFloatReveal = React.forwardRef<
  HTMLElement,
  WeightlessFloatRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startYMin = 40,
      startYMax = 80,
      startRotationMin = -8,
      startRotationMax = 8,
      duration = 2.5,
      delay = 0,
      stagger = 0.06,
      ease = "power3.out",
      viewportOnce = true,
      triggerStart = "top 85%",
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
          ".weightless-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              y: () => gsap.utils.random(startYMin, startYMax),
              rotation: () =>
                gsap.utils.random(startRotationMin, startRotationMax),
              opacity: 0,
            },
            {
              y: 0,
              rotation: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease,
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
          text,
          startYMin,
          startYMax,
          startRotationMin,
          startRotationMax,
          duration,
          delay,
          stagger,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      willChange: "transform, opacity",
      display: "inline-block",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn(
          "flex flex-wrap text-left whitespace-pre-wrap",
          className
        )}
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
                      className="weightless-item"
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
                className="weightless-item"
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

WeightlessFloatReveal.displayName = "WeightlessFloatReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { WeightlessFloatReveal } from "@/registry/ui/weightless-float-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <WeightlessFloatReveal
        as="h1"
        text="Defying gravity."
        className="text-6xl font-bold"
        splitBy="char"
        startYMin={40}
        startYMax={80}
        duration={2.5}
        stagger={0.06}
      />
    </main>
  )
}
```
