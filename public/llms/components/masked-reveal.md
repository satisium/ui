# Masked Reveal Component Context

**Description:** A sophisticated text reveal component for Satis UI. Wraps elements in a hidden overflow mask and pushes them up into view with a slight, elegant rotation. Includes clearProps rendering fixes, full screen reader support, and robust reduced-motion failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add masked-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop            | Type                | Default      | Description                  |
| :-------------- | :------------------ | :----------- | :--------------------------- |
| `text`          | `string`            | _Required_   | The text string.             |
| `as`            | `React.ElementType` | `"div"`      | HTML element to render.      |
| `splitBy`       | `"word" \| "char"`  | `"word"`     | Split mode.                  |
| `startOffset`   | `string \| number`  | `"100%"`     | Initial Y offset.            |
| `startRotation` | `number`            | `5`          | Initial Z rotation.          |
| `delay`         | `number`            | `0`          | Intro delay.                 |
| `duration`      | `number`            | `1.2`        | Animation duration.          |
| `stagger`       | `number`            | `0.04`       | Stagger timing.              |
| `ease`          | `string`            | `"expo.out"` | GSAP ease function.          |
| `viewportOnce`  | `boolean`           | `true`       | Toggle repeating animations. |
| `triggerStart`  | `string`            | `"top 90%"`  | Scroll trigger coordinate.   |

## 3. Core Component Source

**File Path:** `components/ui/masked-reveal.tsx`

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

export interface MaskedRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startOffset?: string | number
  startRotation?: number
  delay?: number
  duration?: number
  stagger?: number
  ease?: string
  viewportOnce?: boolean
  triggerStart?: string
}

export const MaskedReveal = React.forwardRef<HTMLElement, MaskedRevealProps>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startOffset = "100%",
      startRotation = 5,
      delay = 0,
      duration = 1.2,
      stagger = 0.04,
      ease = "expo.out",
      viewportOnce = true,
      triggerStart = "top 90%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    const resolveOffset =
      typeof startOffset === "number" ? `${startOffset}px` : startOffset

    useGSAP(
      () => {
        if (!containerRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".reveal-item",
          containerRef.current
        )

        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              y: resolveOffset,
              rotationZ: startRotation,
              transformOrigin: "top left",
            },
            {
              y: "0%",
              rotationZ: 0,
              duration,
              stagger,
              delay,
              ease,
              force3D: true,
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

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              y: resolveOffset,
              rotationZ: startRotation
            },
            {
              opacity: 1,
              y: "0%",
              rotationZ: 0,
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
          resolveOffset,
          startRotation,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const words = text.split(/(\s+)/)

    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform",
      backfaceVisibility: "hidden",
      WebkitFontSmoothing: "antialiased",
      transform: `translateY(${resolveOffset}) rotate(${startRotation}deg)`,
      transformOrigin: "top left",
    }

    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("flex flex-wrap whitespace-pre-wrap", className)}
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
                      className="inline-flex overflow-hidden"
                      style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
                    >
                      <span
                        className="reveal-item inline-block"
                        style={ssrInitialStyles}
                      >
                        {char}
                      </span>
                    </span>
                  ))}
                </span>
              )
            }

            return (
              <span
                key={wordIndex}
                className="inline-flex overflow-hidden"
                style={{ paddingBottom: "0.2em", margin: "-0.1em 0" }}
              >
                <span
                  className="reveal-item inline-block"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              </span>
            )
          })}
        </span>
      </Component>
    )
  }
)

MaskedReveal.displayName = "MaskedReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { MaskedReveal } from "@/components/ui/masked-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <MaskedReveal
        as="h1"
        text="Crafting highly polished experiences."
        className="text-6xl font-semibold"
        delay={0.2}
        stagger={0.04}
        splitBy="char"
        startOffset="120%"
      />
    </main>
  )
}
```
