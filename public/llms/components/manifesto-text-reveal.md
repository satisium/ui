# Manifesto Text Reveal Component Context

**Description:** A premium scrollytelling text reveal component for Satis UI. Fades text in word-by-word or character-by-character, utilizing scroll momentum and optional DOM pinning to create a cinematic reading experience. Fully accessible and handles FOUC prevention dynamically.

## 1. Installation

To add this component to a project, run:

```bash
npx satis-ui add manifesto-text-reveal
```

**Dependencies installed:** `gsap`, `@gsap/react`, `clsx`, `tailwind-merge`.

## 2. Props API

| Prop              | Type                    | Default        | Description                                               |
| :---------------- | :---------------------- | :------------- | :-------------------------------------------------------- |
| `text`            | `string`                | _Required_     | The text string.                                          |
| `as`              | `React.ElementType`     | `"p"`          | HTML element to render.                                   |
| `scrub`           | `boolean \| number`     | `1`            | Scroll binding logic. Number dictates seconds of inertia. |
| `splitLevel`      | `"word" \| "character"` | `"word"`       | Split mode.                                               |
| `inactiveOpacity` | `number`                | `0.2`          | Faded state opacity.                                      |
| `pin`             | `boolean`               | `false`        | Enables DOM pinning during scroll tracking.               |
| `triggerStart`    | `string`                | `"top 80%"`    | Scroll trigger start coordinate.                          |
| `triggerEnd`      | `string`                | `"bottom 50%"` | Scroll trigger end coordinate.                            |

## 3. Core Component Source

**File Path:** `components/ui/manifesto-text-reveal.tsx`

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

export interface ManifestoTextRevealProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  scrub?: boolean | number
  splitLevel?: "word" | "character"
  inactiveOpacity?: number
  triggerStart?: string
  triggerEnd?: string
  pin?: boolean
}

export const ManifestoTextReveal = React.forwardRef<
  HTMLElement,
  ManifestoTextRevealProps
>(
  (
    {
      text,
      as = "p",
      className,
      scrub = 1,
      splitLevel = "word",
      inactiveOpacity = 0.2,
      triggerStart = "top 80%",
      triggerEnd = "bottom 50%",
      pin = false,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<any>(null)
    React.useImperativeHandle(ref, () => containerRef.current)

    const scrubValue = scrub === true ? 1 : scrub
    const isScrubbing = scrub !== false

    useGSAP(
      () => {
        if (!containerRef.current) return

        const targets = gsap.utils.toArray<HTMLElement>(
          ".manifesto-target",
          containerRef.current
        )

        if (targets.length === 0) return

        const mm = gsap.matchMedia()

        mm.add("(prefers-reduced-motion: no-preference)", () => {
          if (isScrubbing) {
            gsap.fromTo(
              targets,
              { opacity: inactiveOpacity },
              {
                opacity: 1,
                stagger: 0.1,
                ease: "none",
                scrollTrigger: {
                  trigger: containerRef.current,
                  pin: pin,
                  start: triggerStart,
                  end: triggerEnd,
                  scrub: scrubValue,
                },
              }
            )
          } else {
            gsap.fromTo(
              targets,
              { opacity: inactiveOpacity, y: 8, filter: "blur(4px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: splitLevel === "character" ? 0.02 : 0.04,
                duration: 0.8,
                ease: "power3.out",
                clearProps: "filter,transform",
                scrollTrigger: {
                  trigger: containerRef.current,
                  start: triggerStart,
                  once: true,
                },
              }
            )
          }
        })

        mm.add("(prefers-reduced-motion: reduce)", () => {
          gsap.fromTo(
            targets,
            { opacity: inactiveOpacity },
            {
              opacity: 1,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                pin: pin,
                start: triggerStart,
                end: isScrubbing ? triggerEnd : undefined,
                scrub: isScrubbing ? scrubValue : false,
                once: !isScrubbing,
              },
            }
          )
        })

        return () => mm.revert()
      },
      {
        scope: containerRef,
        dependencies: [
          scrub,
          scrubValue,
          isScrubbing,
          splitLevel,
          inactiveOpacity,
          triggerStart,
          triggerEnd,
          pin,
        ],
      }
    )

    const ssrInitialStyles: React.CSSProperties = isScrubbing
      ? { opacity: inactiveOpacity, willChange: "opacity" }
      : {
          opacity: inactiveOpacity,
          transform: "translateY(8px)",
          filter: "blur(4px)",
          willChange: "opacity, transform, filter",
        }

    const words = text.split(/(\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        {...props}
      >
        <span aria-hidden="true" className="flex flex-wrap">
          {words.map((word, wordIdx) => {
            if (word.match(/\s+/)) {
              return (
                <span key={wordIdx} className="inline-block whitespace-pre">
                  {word}
                </span>
              )
            }

            if (splitLevel === "character") {
              return (
                <span key={wordIdx} className="inline-flex whitespace-nowrap">
                  {word.split("").map((char, charIdx) => (
                    <span
                      key={`${wordIdx}-${charIdx}`}
                      className="manifesto-target inline-block"
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
                key={wordIdx}
                className="manifesto-target inline-block"
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

ManifestoTextReveal.displayName = "ManifestoTextReveal"
```

## 4. Example Implementation

**File Path:** `app/page.tsx`

```tsx
"use client"

import { ManifestoTextReveal } from "@/components/ui/manifesto-text-reveal"

export default function ExamplePage() {
  return (
    <main className="relative w-full">
      <section className="flex h-screen items-center justify-center">
        <ManifestoTextReveal
          as="h2"
          text="Clarity is the ultimate luxury."
          className="text-4xl font-semibold"
          splitLevel="character"
          scrub={2}
          pin={true}
          inactiveOpacity={0.15}
          triggerStart="center center"
          triggerEnd="+=100%"
        />
      </section>
      <div className="h-screen w-full" />
    </main>
  )
}
```
