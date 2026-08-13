export const fluidTypewriterHeadlineDemoString = `
import { FluidTypewriter } from "@/components/satisium-ui/fluid-typewriter"

export default function FluidTypewriterHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <FluidTypewriter
          as="h1"
          text="Seamless fluidity."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          baseSpeed={0.05}
          variance={0.03}
          delay={0.3}
          cursorClassName="bg-primary shadow-[0_0_20px_var(--primary)]"
        />
      </div>
    </main>
  )
}
`

export const fluidTypewriterParagraphDemoString = `
import { FluidTypewriter } from "@/components/satisium-ui/fluid-typewriter"

export default function FluidTypewriterParagraphDemo() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      <div className="flex w-full items-center justify-center px-6 pt-[90vh] pb-[25vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <FluidTypewriter
            as="h2"
            text="Notice how the cursor glides, gracefully wraps to new lines, and organically hesitates at punctuation marks. It feels less like a machine, and more like a thought forming in real time."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            triggerStart="top 85%"
            baseSpeed={0.05}
            variance={0.03}
            cursorClassName="bg-primary shadow-[0_0_15px_var(--primary)]"
            viewportOnce={true}
          />
        </div>
      </div>
    </main>
  )
}
`

export const fluidTypewriterString = `"use client"

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
`

export const fluidTypewriterFile = {
  "fluid-typewriter.tsx": {
    code: fluidTypewriterString,
    language: "tsx",
  },
}
