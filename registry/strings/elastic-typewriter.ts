export const elasticTypewriterHeadlineDemoString = `
import { ElasticTypewriter } from "@/components/satisium-ui/elastic-typewriter"

export default function ElasticTypewriterHeadlineDemo() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="max-w-4xl px-6 text-center">
        <ElasticTypewriter
          as="h1"
          text="Tension & elasticity."
          className="text-6xl leading-[1.1] font-bold tracking-tighter md:text-8xl"
          delay={0.4}
          baseSpeed={0.05} 
          variance={0.03}
          cursorClassName="bg-primary"
        />
      </div>
    </main>
  )
}
`

export const elasticTypewriterParagraphDemoString = `
import { ElasticTypewriter } from "@/components/satisium-ui/elastic-typewriter"

export default function ElasticTypewriterParagraphDemo() {
  return (
    <main className="relative min-h-[250vh] w-full bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute top-[25vh] flex w-full flex-col items-center gap-4 text-sm font-medium tracking-wide text-muted-foreground">
        <span className="tracking-widest uppercase">Scroll to explore</span>
        <div className="h-16 w-[1px] bg-border" />
      </div>

      <div className="flex w-full items-center justify-center px-6 pt-[90vh]">
        <div className="max-w-5xl text-left md:text-justify">
          <ElasticTypewriter
            as="h2"
            text="Meticulously crafted components for modern web applications. Elevate your interface with uncompromising performance, accessibility, and refined design."
            className="text-3xl leading-[1.4] font-medium tracking-tight md:text-5xl lg:text-6xl"
            triggerStart="top 85%"
            baseSpeed={0.02} 
            variance={0.015} 
            cursorClassName="bg-primary"
            viewportOnce={true}
          />
        </div>
      </div>
    </main>
  )
}
`

export const elasticTypewriterString = `"use client"

import * as React from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export interface ElasticTypewriterProps
  extends React.HTMLAttributes<HTMLElement> {
  text: string
  as?: React.ElementType
  cursorClassName?: string
  baseSpeed?: number
  variance?: number
  delay?: number
  viewportOnce?: boolean
  triggerStart?: string
}

export const ElasticTypewriter = React.forwardRef<
  HTMLElement,
  ElasticTypewriterProps
>(
  (
    {
      text,
      as = "h1",
      className,
      cursorClassName = "bg-primary",
      baseSpeed = 0.04,
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

        const charContainers = gsap.utils.toArray<HTMLElement>(
          ".elastic-char-container",
          containerRef.current
        )
        if (charContainers.length === 0) return

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
                x: charContainers[0].offsetLeft,
                y: charContainers[0].offsetTop,
                opacity: 1,
                display: "inline-block",
              })
            },
            onComplete: () => {
              cursorBlink.play()
            },
          })

          let timePos = 0

          charContainers.forEach((container, i) => {
            const charText = container.getAttribute("data-char") || ""
            const isLast = i === charContainers.length - 1

            let nextX, nextY
            if (isLast) {
              nextX = container.offsetLeft + container.offsetWidth
              nextY = container.offsetTop
            } else {
              nextX = charContainers[i + 1].offsetLeft
              nextY = charContainers[i + 1].offsetTop
            }

            const isLineBreak = nextY > container.offsetTop + 5
            let duration = baseSpeed + Math.random() * variance

            if (isLineBreak) duration = 0.15 
            else if (charText === " ") duration = baseSpeed * 1.5 

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

            const visibleChar = container.querySelector(".elastic-visible")

            if (visibleChar) {
              tl.fromTo(
                visibleChar,
                {
                  opacity: 0,
                  y: 20,
                  scaleY: 1.5,
                  scaleX: 0.7,
                  skewX: -20,
                },
                {
                  opacity: 1,
                  y: 0,
                  scaleY: 1,
                  scaleX: 1,
                  skewX: 0,
                  duration: 1.2,
                  ease: "elastic.out(1, 0.3)",
                  force3D: true,
                },
                timePos
              )
            }

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
            
            const last = charContainers[charContainers.length - 1]
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
          
          const visibleChars = gsap.utils.toArray(".elastic-visible", containerRef.current)
          
          gsap.fromTo(
            visibleChars,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              stagger: 0.02,
              ease: "none",
              scrollTrigger: {
                trigger: containerRef.current,
                start: triggerStart,
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
      transform: "translateY(20px) scaleY(1.5) scaleX(0.7) skewX(-20deg)",
      transformOrigin: "bottom center",
      willChange: "transform, opacity",
    }

    const words = text.split(/(\\s+)/)
    const Component = as as any

    return (
      <Component
        ref={containerRef}
        aria-label={text}
        className={cn("relative text-left whitespace-pre-wrap", className)}
        style={{ padding: "0.2em 0" }}
        {...props}
      >
        <span aria-hidden="true">
          {words.map((word, wordIndex) => {
            if (word.match(/\\s+/)) {
              return (
                <span
                  key={wordIndex}
                  className="elastic-char-container inline-block whitespace-pre"
                  data-char={word}
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
                    className="elastic-char-container inline-grid items-baseline justify-items-center [grid-template-areas:'stack']"
                    data-char={char}
                  >
                    <span className="invisible [grid-area:stack]">{char}</span>

                    <span
                      className="elastic-visible [grid-area:stack]"
                      style={ssrInitialStyles}
                    >
                      {char}
                    </span>
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
            "mt-[0.05em] h-[1.15em] w-[0.1em]",
            cursorClassName
          )}
        />
      </Component>
    )
  }
)

ElasticTypewriter.displayName = "ElasticTypewriter"
`

export const elasticTypewriterFile = {
  "elastic-typewriter.tsx": {
    code: elasticTypewriterString,
    language: "tsx",
  },
}
