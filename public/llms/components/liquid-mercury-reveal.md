# Liquid Mercury Reveal Component Context

**Description:** An elastic, metallic text reveal component for Satis UI. Elements spawn from inside the previous element's mass, stretching a gooey liquid bridge that elastically snaps into sharp, crisp typography. Handles clean resolution to native font anti-aliasing via dynamic SVG filter removal.

## 1. Installation

To add this component to a project, run:

```bash
npx shadcn@latest add https://ui.satisium.com/r/liquid-mercury-reveal.json
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop           | Type                | Default     | Description                         |
| :------------- | :------------------ | :---------- | :---------------------------------- |
| `text`         | `string`            | _Required_  | The text string.                    |
| `as`           | `React.ElementType` | `"h1"`      | HTML element to render.             |
| `splitBy`      | `"word" \| "char"`  | `"char"`    | Split mode.                         |
| `duration`     | `number`            | `2.5`       | Animation duration.                 |
| `delay`        | `number`            | `0`         | Intro delay.                        |
| `stagger`      | `number`            | `0.05`      | Stagger timing between items.       |
| `startingBlur` | `number`            | `12`        | Initial blur for liquid generation. |
| `viewportOnce` | `boolean`           | `true`      | Toggle repeating animations.        |
| `triggerStart` | `string`            | `"top 85%"` | Scroll trigger coordinate.          |

## 3. Core Component Source

**File Path:** `components/ui/liquid-mercury-reveal.tsx`

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

export interface LiquidMercuryRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  duration?: number
  delay?: number
  stagger?: number
  startingBlur?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const LiquidMercuryReveal = React.forwardRef<
  HTMLElement,
  LiquidMercuryRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 2.5,
      delay = 0,
      stagger = 0.05,
      startingBlur = 12,
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    const blurRef = React.useRef<SVGFEGaussianBlurElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = `liquid-mercury-${uniqueId}`

    useGSAP(
      () => {
        if (!containerRef.current || !blurRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".mercury-item",
          containerRef.current
        )
        if (elements.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: triggerStart,
              once: viewportOnce,
              toggleActions: viewportOnce
                ? "play none none none"
                : "play none none reverse",
            },
            onUpdate: function () {
              if (!containerRef.current) return
              if (this.progress() === 1) {
                containerRef.current.style.filter = "none"
              } else {
                containerRef.current.style.filter = `url(#${filterId})`
              }
            },
          })

          const totalStaggerTime = duration + (elements.length - 1) * stagger

          tl.fromTo(
            blurRef.current,
            { attr: { stdDeviation: startingBlur } },
            {
              attr: { stdDeviation: 0 },
              duration: totalStaggerTime,
              ease: "power2.out",
              delay,
            },
            0
          )

          tl.fromTo(
            elements,
            {
              opacity: 0,
              x: -40,
              scale: 0.8,
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: duration,
              delay,
              stagger,
              ease: "elastic.out(1.2, 0.4)",
              force3D: true,
              clearProps: "transform,scale,opacity",
            },
            0
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
          text,
          duration,
          delay,
          stagger,
          startingBlur,
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
      <>
        <svg
          width="0"
          height="0"
          className="absolute hidden"
          aria-hidden="true"
        >
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur
              ref={blurRef}
              in="SourceGraphic"
              stdDeviation={startingBlur}
              result="BLUR"
            />
            <feColorMatrix
              in="BLUR"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 20 -8"
              result="GOOEY"
            />
          </filter>
        </svg>

        <Component
          ref={containerRef}
          aria-label={text}
          className={cn("flex flex-wrap text-left whitespace-pre-wrap", className)}
          style={{
            filter: `url(#${filterId})`,
            WebkitTransform: "translateZ(0)",
          }}
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
                        className="mercury-item"
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
                  className="mercury-item"
                  style={ssrInitialStyles}
                >
                  {word}
                </span>
              )
            })}
          </span>
        </Component>
      </>
    )
  }
)

LiquidMercuryReveal.displayName = "LiquidMercuryReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { LiquidMercuryReveal } from "@/components/ui/liquid-mercury-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <LiquidMercuryReveal
        as="h1"
        text="Elastic physics."
        className="text-6xl font-bold"
        splitBy="char"
        startingBlur={12}
        duration={2.5}
        stagger={0.06}
      />
    </main>
  )
}
```
