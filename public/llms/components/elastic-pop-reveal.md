# Elastic Pop Reveal Component Context

**Description:** A tactile, physics-based text reveal component for Satis UI. Splinters text into words or characters and scales them in with a highly customizable GSAP elastic spring effect, triggered on scroll. Features robust screen reader support and vestibular failsafes.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add elastic-pop-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default                 | Description                                           |
| :------------- | :------------------ | :---------------------- | :---------------------------------------------------- |
| `text`         | `string`            | _Required_              | The string of text to reveal.                         |
| `as`           | `React.ElementType` | `"div"`                 | HTML tag to render.                                   |
| `splitBy`      | `"word" \| "char"`  | `"word"`                | Split mode.                                           |
| `startScale`   | `number`            | `0.5`                   | Starting scale of the elements.                       |
| `startOpacity` | `number`            | `0`                     | Starting opacity.                                     |
| `delay`        | `number`            | `0`                     | Initial animation delay.                              |
| `ease`         | `string`            | `"elastic.out(1, 0.4)"` | Spring configuration (amplitude, frequency).          |
| `duration`     | `number`            | `1.5`                   | Animation duration.                                   |
| `stagger`      | `number`            | `0.05`                  | Stagger timing between items.                         |
| `viewportOnce` | `boolean`           | `true`                  | Reverse animation when scrolled out of view if false. |
| `triggerStart` | `string`            | `"top 90%"`             | ScrollTrigger start position.                         |

## 3. Core Component Source

**File Path:** `components/ui/elastic-pop-reveal.tsx`

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

export interface ElasticPopRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  startScale?: number
  startOpacity?: number
  delay?: number
  ease?: string
  duration?: number
  stagger?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const ElasticPopReveal = React.forwardRef<
  HTMLElement,
  ElasticPopRevealProps
>(
  (
    {
      text,
      as = "div",
      className,
      splitBy = "word",
      startScale = 0.5,
      startOpacity = 0,
      delay = 0,
      duration = 1.5,
      stagger = 0.05,
      ease = "elastic.out(1, 0.4)",
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
          ".pop-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.fromTo(
            elements,
            {
              scale: startScale,
              opacity: startOpacity,
            },
            {
              scale: 1,
              opacity: 1,
              duration,
              stagger,
              delay,
              ease,
              force3D: true,
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
            { opacity: startOpacity },
            {
              opacity: 1,
              duration: 0.5,
              stagger,
              delay,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
          startScale,
          startOpacity,
          duration,
          stagger,
          delay,
          ease,
          viewportOnce,
          triggerStart,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = {
      willChange: "transform, opacity",
      opacity: startOpacity,
      transform: `scale(${startScale})`,
      transformOrigin: "center center",
    }

    const words = text.split(/(\s+)/)
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
                      className="pop-item inline-block"
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
                className="pop-item inline-block"
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

ElasticPopReveal.displayName = "ElasticPopReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { ElasticPopReveal } from "@/components/ui/elastic-pop-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <ElasticPopReveal
        as="h1"
        text="Tactile typography."
        splitBy="char"
        duration={1.8}
        stagger={0.03}
        ease="elastic.out(1.2, 0.3)"
      />
    </main>
  )
}
```
