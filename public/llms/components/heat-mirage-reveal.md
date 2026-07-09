# Heat Mirage Reveal Component Context

**Description:** A cinematic atmospheric reveal component for Satis UI. Uses an SVG displacement map to simulate atmospheric thermal distortion (heat waves). The text drifts upward and materializes as the heat dissipates into sharp focus. Automatically resolves SVG filtering to native browser anti-aliasing to prevent blur artifacts.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add heat-mirage-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop                   | Type                | Default     | Description                      |
| :--------------------- | :------------------ | :---------- | :------------------------------- |
| `text`                 | `string`            | _Required_  | The text string.                 |
| `as`                   | `React.ElementType` | `"h1"`      | HTML element to render.          |
| `splitBy`              | `"word" \| "char"`  | `"char"`    | Split mode.                      |
| `duration`             | `number`            | `2.5`       | Animation duration.              |
| `delay`                | `number`            | `0`         | Intro delay.                     |
| `stagger`              | `number`            | `0.08`      | Stagger timing between items.    |
| `startingDisplacement` | `number`            | `35`        | Intensity of the thermal waving. |
| `viewportOnce`         | `boolean`           | `true`      | Toggle repeating animations.     |
| `triggerStart`         | `string`            | `"top 85%"` | Scroll trigger coordinate.       |

## 3. Core Component Source

**File Path:** `components/ui/heat-mirage-reveal.tsx`

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

export interface HeatMirageRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  splitBy?: "word" | "char"
  duration?: number
  delay?: number
  stagger?: number
  startingDisplacement?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const HeatMirageReveal = React.forwardRef<
  HTMLElement,
  HeatMirageRevealProps
>(
  (
    {
      text,
      as = "h1",
      className,
      splitBy = "char",
      duration = 2.5,
      delay = 0,
      stagger = 0.08,
      startingDisplacement = 35,
      viewportOnce = true,
      triggerStart = "top 85%",
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    const mapRef = React.useRef<SVGFEDisplacementMapElement>(null)

    React.useImperativeHandle(ref, () => containerRef.current)

    const uniqueId = React.useId().replace(/:/g, "")
    const filterId = `heat-mirage-${uniqueId}`

    useGSAP(
      () => {
        if (!containerRef.current || !mapRef.current) return

        const elements = gsap.utils.toArray<HTMLElement>(
          ".mirage-item",
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

          const totalStaggerTime = duration + elements.length * stagger

          tl.fromTo(
            mapRef.current,
            { attr: { scale: startingDisplacement } },
            {
              attr: { scale: 0 },
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
              y: 20,
              scale: 1.05,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: duration * 0.8,
              delay,
              stagger,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity,scale",
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
          startingDisplacement,
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
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.25"
              numOctaves="2"
              result="HEAT_WAVES"
            />
            <feDisplacementMap
              ref={mapRef}
              in="SourceGraphic"
              in2="HEAT_WAVES"
              scale={startingDisplacement}
              xChannelSelector="R"
              yChannelSelector="G"
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
                        className="mirage-item"
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
                  className="mirage-item"
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

HeatMirageReveal.displayName = "HeatMirageReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { HeatMirageReveal } from "@/components/ui/heat-mirage-reveal"

export default function ExamplePage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <HeatMirageReveal
        as="h1"
        text="Thermal dynamics."
        className="text-6xl font-bold"
        splitBy="char"
        startingDisplacement={40}
        duration={2.5}
        stagger={0.06}
      />
    </main>
  )
}
```
