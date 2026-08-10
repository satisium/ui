# Flip Vertical Reveal Component Context

**Description:** A 3D mechanical text reveal component for Satis UI. Simulates a split-flap display or falling dominoes by hinging characters or words down from a 90-degree 3D perspective.

## 1. Installation

To add this component to a project, run:

```bash
npx satisium-ui add flip-vertical-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                   |
| :------------- | :------------------ | :---------- | :---------------------------- |
| `text`         | `string`            | _Required_  | The text string.              |
| `as`           | `React.ElementType` | `"h1"`      | HTML tag to render.           |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                   |
| `startAngle`   | `number`            | `-90`       | Starting X-axis rotation.     |
| `startY`       | `string`            | `"0.4em"`   | Starting Y-axis translation.  |
| `duration`     | `number`            | `0.8`       | Animation duration.           |
| `delay`        | `number`            | `0`         | Intro delay.                  |
| `stagger`      | `number`            | `0.03`      | Stagger timing between items. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.  |
| `triggerStart` | `string`            | `"top 90%"` | ScrollTrigger start position. |

## 3. Core Component Source

**File Path:** `components/ui/flip-vertical-reveal.tsx`

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

export interface FlipVerticalRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startAngle?: number
  startY?: string
  duration?: number
  delay?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const FlipVerticalReveal = React.forwardRef<
  HTMLElement,
  FlipVerticalRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      startAngle = -90,
      startY = "0.4em",
      duration = 0.8,
      delay = 0,
      stagger = 0.03,
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
          ".flip-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              rotateX: startAngle,
              y: startY,
              opacity: 0,
            },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              duration,
              delay,
              stagger,
              ease: "back.out(1.4)",
              force3D: true,
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
          startAngle,
          startY,
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
      transform: `translateY(${startY}) rotateX(${startAngle}deg)`,
      transformOrigin: "bottom center",
      transformStyle: "preserve-3d",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
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
                      className="flip-item inline-block"
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
                className="flip-item inline-block"
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

FlipVerticalReveal.displayName = "FlipVerticalReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { FlipVerticalReveal } from "@/components/ui/flip-vertical-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <FlipVerticalReveal
        as="h1"
        text="Elevating the standard."
        className="text-6xl font-bold"
        splitBy="char"
        duration={0.9}
        stagger={0.04}
      />
    </main>
  )
}
```
