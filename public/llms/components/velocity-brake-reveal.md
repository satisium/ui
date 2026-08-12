# Velocity Brake Reveal Component Context

**Description:** A kinetic text reveal component for Satis UI. Elements slide in rapidly from an offset and slam on the brakes, whipping forward into a heavy skew overshoot before settling. Includes complete GSAP `clearProps` cleanup for pristine font rendering, ARIA screen-reader support, and vestibular motion failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/velocity-brake-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                                   |
| :------------- | :------------------ | :---------- | :-------------------------------------------- |
| `text`         | `string`            | _Required_  | The text string.                              |
| `as`           | `React.ElementType` | `"h1"`      | HTML element to render.                       |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                                   |
| `startX`       | `string \| number`  | `"-3em"`    | Starting X offset (e.g., `-3em` or `-100px`). |
| `startSkew`    | `number`            | `-25`       | Starting skew angle (drag simulation).        |
| `duration`     | `number`            | `0.9`       | Animation duration.                           |
| `delay`        | `number`            | `0`         | Intro delay.                                  |
| `stagger`      | `number`            | `0.04`      | Stagger timing between items.                 |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.                  |
| `triggerStart` | `string`            | `"top 90%"` | Scroll trigger coordinate.                    |

## 3. Core Component Source

**File Path:** `registry/ui/velocity-brake-reveal.tsx`

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

export interface VelocityBrakeRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startX?: string | number
  startSkew?: number
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const VelocityBrakeReveal = React.forwardRef<
  HTMLElement,
  VelocityBrakeRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startX = "-3em",
      startSkew = -25,
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
          ".brake-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              x: startX,
              skewX: startSkew,
              opacity: 0,
            },
            {
              x: 0,
              skewX: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(2.5)",
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
          startX,
          startSkew,
          duration,
          delay,
          stagger,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      opacity: 0,
      transform: `translateX(${startX}) skewX(${startSkew}deg)`,
      transformOrigin: "bottom center",
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
        style={{ padding: "0.2em 0" }}
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
                      className="brake-item"
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
                className="brake-item"
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

VelocityBrakeReveal.displayName = "VelocityBrakeReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { VelocityBrakeReveal } from "@/registry/ui/velocity-brake-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <VelocityBrakeReveal
        as="h1"
        text="Momentum & Friction."
        className="text-6xl font-black"
        splitBy="char"
        duration={0.8}
        stagger={0.03}
        startSkew={-30}
        startX="-4em"
      />
    </main>
  )
}
```
