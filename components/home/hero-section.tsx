"use client"

import React, { useRef, useState, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Menu } from "lucide-react"
import { SatisiumLogo } from "@/components/satisium-logo"
import { PianoTypewriter } from "@/components/home/piano-typewriter"
import { Annotation } from "@/components/home/annotation" // Adjust path as needed

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const textWrapperRef = useRef<HTMLDivElement>(null)
  const squircleRef = useRef<HTMLDivElement>(null)

  const [isTypingComplete, setIsTypingComplete] = useState(false)

  const calculateMetrics = () => {
    if (!textWrapperRef.current || !squircleRef.current) return null

    const chars = textWrapperRef.current.querySelectorAll(
      ".piano-char-container"
    ) as NodeListOf<HTMLElement>
    if (chars.length < 3) return null

    const uChar = chars[0]
    const iChar = chars[1]
    const rightSideChars = Array.from(chars).slice(2)

    const left = uChar.offsetLeft
    const top = uChar.offsetTop
    const width = iChar.offsetLeft + iChar.offsetWidth - left
    const height = uChar.offsetHeight

    const paddingX = width * 0.35
    const paddingY = height * 0.15

    return {
      uChar,
      iChar,
      rightSideChars,
      squircleProps: {
        x: left - paddingX,
        y: top - paddingY,
        width: width + paddingX * 2,
        height: height + paddingY * 2,
      },
      slideAmount: paddingX * 1.5,
    }
  }

  useGSAP(() => {
    if (!isTypingComplete || !sectionRef.current || !squircleRef.current) return

    const metrics = calculateMetrics()
    if (!metrics) return

    // Pre-set squircle
    gsap.set(squircleRef.current, {
      ...metrics.squircleProps,
      scale: 0.5,
      opacity: 0,
    })

    const tl = gsap.timeline()

    // 1. The Morph
    const morphProxy = { progress: 0 }
    tl.to(morphProxy, {
      progress: 1,
      duration: 1.6,
      ease: "power3.inOut",
      onUpdate: () => {
        sectionRef.current?.style.setProperty(
          "--morph",
          morphProxy.progress.toString()
        )
      },
    })

    // 2. The Staggered UI Glide-In
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=0.8"
    )
    tl.fromTo(
      footerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=1.0"
    )

    // 3. THE REFINED SEQUENCE: Slide First, Then Pop
    tl.to(
      metrics.rightSideChars,
      {
        x: metrics.slideAmount,
        duration: 0.8,
        ease: "power3.inOut",
        force3D: true,
      },
      "-=0.4"
    )

    tl.to(
      squircleRef.current,
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(2)",
      },
      "-=0.2"
    )

    tl.to(
      [metrics.uChar, metrics.iChar],
      {
        color: "var(--primary-foreground)",
        duration: 0.3,
        ease: "power1.inOut",
      },
      "<"
    )

    const handleResize = () => {
      const newMetrics = calculateMetrics()
      if (!newMetrics) return
      gsap.set(squircleRef.current, { ...newMetrics.squircleProps })
      gsap.set(newMetrics.rightSideChars, { x: newMetrics.slideAmount })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isTypingComplete])

  return (
    <>
      {/* Natively inject Caveat font for the annotations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');`,
        }}
      />

      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden bg-muted"
        style={
          {
            "--morph": "0",
            padding: "calc(var(--morph) * clamp(0.75rem, 3vw, 1.5rem))",
          } as React.CSSProperties
        }
      >
        <div
          className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-background text-foreground"
          style={{
            borderRadius: "calc(var(--morph) * clamp(2rem, 4vw, 2.5rem))",
          }}
        >
          {/* --- HEADER --- */}
          <header
            ref={headerRef}
            className="relative z-10 flex w-full items-start justify-between p-6 opacity-0 sm:p-8 md:p-10"
          >
            <div className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
              <SatisiumLogo size="100%" />
            </div>
            <button
              aria-label="Open Menu"
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-muted sm:h-12 sm:w-12"
            >
              <Menu
                className="h-5 w-5 text-foreground transition-transform group-hover:scale-95 sm:h-6 sm:w-6"
                strokeWidth={1.5}
              />
            </button>
          </header>

          {/* --- CENTER ANCHOR --- */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
            <div
              ref={textWrapperRef}
              className="relative inline-block text-left"
            >
              {/* THE TARGET: Given an ID so the annotations can lerp track it */}
              <div
                id="hero-squircle"
                ref={squircleRef}
                className="absolute top-0 left-0 z-0 rounded-[0.5rem] bg-primary opacity-0 drop-shadow-2xl will-change-transform sm:rounded-[0.75rem]"
              />

              <PianoTypewriter
                text="ui.satisium.com"
                as="h1"
                className="relative z-10 font-heading text-3xl font-bold tracking-tight text-foreground min-[400px]:text-4xl sm:text-5xl md:text-6xl"
                cursorClassName="bg-primary"
                delay={0.5}
                onComplete={() => setIsTypingComplete(true)}
              />
            </div>
          </div>

          {/* --- FOOTER --- */}
          <footer
            ref={footerRef}
            className="relative z-10 flex w-full flex-col-reverse items-start justify-between gap-5 p-5 opacity-0 sm:flex-row sm:items-end sm:gap-6 sm:p-8 md:p-10"
          >
            <div className="flex w-full flex-row items-center justify-between sm:w-auto sm:flex-col sm:items-start sm:justify-end sm:space-y-1">
              <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground sm:text-base">
                25+ components
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Ever growing collection
              </p>
            </div>
            <button className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-4 font-heading text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] focus:outline-none active:scale-[0.98] sm:w-auto sm:px-8">
              Explore components
            </button>
          </footer>
        </div>

        {/* --- THE HAND-DRAWN ANNOTATIONS --- */}
        {/* We only render them after typing is complete so their `delay` starts ticking perfectly in sync with the morph timeline */}
        {isTypingComplete && (
          <div className="hidden md:block">
            {/* 1. Top Left Annotation */}
            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: -0.1, y: 0 }} // Points to the top-left of the squircle
              svgAnchor={{ x: 1, y: 1 }} // Uses bottom-right of SVG to touch
              delay={2600} // Waits for the GSAP morph and squircle pop to finish
              path="M0.734573 0.478027C43.1879 13.4972 93.6013 27.0589 83.5186 39.5357C67.068 52.5549 34.6972 35.7384 12.9399 33.0261C4.36469 31.9571 -20.4921 50.385 39.4733 76.9659C87.4456 98.2307 100.146 101.377 100.5 100.292"
              svgClassName="text-muted-foreground/40"
              textClassName="text-muted-foreground -rotate-24 text-xl"
              textPosition="bottom-full right-full -mb-4 -mr-12 text-center"
            >
              Components, blocks
              <br />
              and templates built
              <br />
              for{" "}
              <span className="text-2xl font-extrabold text-foreground">
                SHADCN
              </span>{" "}
              env
            </Annotation>

            {/* 2. Bottom Center Annotation */}
            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: 0.1, y: 1.1 }} // Points to the bottom-center
              svgAnchor={{ x: 1, y: 0 }} // Uses top-right of SVG to touch
              delay={3000} // Staggered slightly after the first one
              path="M0.110596 100.068C32.9148 92.6213 52.2403 77.7336 58.8408 68.6851C64.6609 60.7064 80.0048 33.0468 39.264 34.6426C-1.47676 36.2383 24.9355 83.2422 46.1423 87.8341C80.5339 95.2809 95.3487 34.6426 100.111 0.0681152"
              svgClassName="text-muted-foreground/40"
              textClassName="text-muted-foreground -rotate-8 text-xl"
              textPosition="top-full right-full mt-2 mr-2 text-right"
            >
              Over{" "}
              <span className="text-3xl font-extrabold text-foreground">
                25+{" "}
              </span>
              components
            </Annotation>

            {/* 3. Top Right Annotation */}
            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: 0.9, y: -0.1 }} // Points to the top-right
              svgAnchor={{ x: 0, y: 1 }} // Uses bottom-left of SVG to touch
              delay={3400} // The final flourish
              path="M0.5 100.017C0.5 21.5168 102.954 74.0168 100.455 0.0168457"
              svgClassName="text-muted-foreground/40"
              textClassName="text-muted-foreground rotate-8 text-xl"
              textPosition="bottom-full left-full mb-1 -ml-8"
            >
              Open source
            </Annotation>
          </div>
        )}
      </section>
    </>
  )
}
