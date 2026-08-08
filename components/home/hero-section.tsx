"use client"

import React, { useRef, useState } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

import { SatisiumLogo } from "@/components/satisium-logo"
import { PianoTypewriter } from "@/components/home/piano-typewriter"
import { Annotation } from "@/components/home/annotation"
import { MinimalThemeSwitcher } from "./minimal-theme-switcher"
import { CommandMenuTrigger } from "../layout/command-menu"
import { VideoExploreButton } from "@/components/home/video-explore-button"
import {
  DesktopGithubButton,
  MobileMediaCard,
} from "@/components/home/hero-footer-components"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const textWrapperRef = useRef<HTMLDivElement>(null)
  const squircleRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [isMorphComplete, setIsMorphComplete] = useState(false)

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

  // ==========================================
  // TIMELINE 1: The Environment (Runs INSTANTLY)
  // ==========================================
  useGSAP(() => {
    const morphProxy = { progress: 0 }

    const tl = gsap.timeline({
      onComplete: () => setIsMorphComplete(true),
    })

    // 1. Morph background immediately using exact original math
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

    // 2. Glide in Header and Footer concurrently
    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=1.2"
    )
    tl.fromTo(
      footerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
      "-=1.2"
    )
  }, [])

  // ==========================================
  // TIMELINE 2: The Climax (Runs AFTER Typing AND Frame Morph complete)
  // ==========================================
  useGSAP(() => {
    if (
      !isTypingComplete ||
      !isMorphComplete ||
      !sectionRef.current ||
      !squircleRef.current ||
      !badgeRef.current
    )
      return

    const metrics = calculateMetrics()
    if (!metrics) return

    gsap.set(squircleRef.current, {
      ...metrics.squircleProps,
      scale: 0.5,
      opacity: 0,
    })

    // Initial state for the badge (hidden and scaled down)
    gsap.set(badgeRef.current, {
      scale: 0.5,
      opacity: 0,
    })

    const tl = gsap.timeline()

    // 1. Slide the text right AND slide the badge simultaneously
    tl.to([...metrics.rightSideChars, badgeRef.current], {
      x: metrics.slideAmount,
      duration: 0.8,
      ease: "power3.inOut",
      force3D: true,
    })

    // 2. Pop the squircle AND the badge at the exact same millisecond
    tl.to(
      [squircleRef.current, badgeRef.current],
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" },
      "-=0.4"
    )

    // 3. Highlight the "ui" text
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
      gsap.set([...newMetrics.rightSideChars, badgeRef.current], {
        x: newMetrics.slideAmount,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isTypingComplete, isMorphComplete])

  return (
    <>
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
            willChange: "padding",
          } as React.CSSProperties
        }
      >
        <div
          className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground"
          style={{
            borderRadius: "calc(var(--morph) * clamp(2rem, 4vw, 2.5rem))",
            willChange: "border-radius",
          }}
        >
          {/* --- HEADER --- */}
          <header
            ref={headerRef}
            className="relative z-10 flex w-full shrink-0 items-start justify-between p-6 opacity-0 sm:p-8 md:p-10"
          >
            <div className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
              <SatisiumLogo size="100%" />
            </div>
            <div className="group flex items-center justify-between gap-2 rounded-full bg-transparent transition-colors">
              <MinimalThemeSwitcher />
              <CommandMenuTrigger variant="icon" />
            </div>
          </header>

          {/* --- CENTER ANCHOR --- */}
          <div className="relative z-0 flex flex-1 items-center justify-center px-4 text-center">
            <div
              ref={textWrapperRef}
              className="relative inline-block text-left"
            >
              <div
                id="hero-squircle"
                ref={squircleRef}
                className="absolute top-0 left-0 z-0 rounded-[0.5rem] bg-primary opacity-0 drop-shadow-2xl will-change-transform sm:rounded-[0.75rem]"
              />

              <PianoTypewriter
                text="ui.satisium.com"
                as="h1"
                className="relative z-10 font-heading text-3xl font-bold tracking-tight text-foreground min-[400px]:text-4xl sm:text-5xl md:text-6xl"
                cursorClassName="hidden"
                delay={0}
                onComplete={() => setIsTypingComplete(true)}
              />

              {/* --- SUPERSCRIPT BETA BADGE --- */}
              <div
                ref={badgeRef}
                className="absolute top-0 left-full z-10 flex items-start opacity-0 will-change-transform"
              >
                {/* 
                  PERFECT ALIGNMENT:
                  - -ml-3 (mobile) and md:-ml-4 (desktop) pulls it tight against the "m".
                  - mt-1.5 pushes it down slightly to align perfectly with the cap height. 
                */}
                <Badge className="mt-1.5 h-[18px] rounded-[5px] border-none bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 md:mt-2">
                  Beta
                </Badge>
              </div>
            </div>
          </div>

          {/* --- RESPONSIVE FOOTER --- */}
          <footer
            ref={footerRef}
            className="relative z-10 flex w-full shrink-0 flex-col p-4 opacity-0 sm:p-6 md:p-10"
          >
            <div className="flex w-full md:hidden">
              <MobileMediaCard />
            </div>
            <div className="hidden w-full items-end justify-between md:flex">
              <DesktopGithubButton />
              <VideoExploreButton href="/docs/components" />
            </div>
          </footer>
        </div>

        {/* --- HAND-DRAWN ANNOTATIONS --- */}
        {isTypingComplete && isMorphComplete && (
          <div className="hidden lg:block">
            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: -0.1, y: 0 }}
              svgAnchor={{ x: 1, y: 1 }}
              delay={800}
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

            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: 0.1, y: 1.1 }}
              svgAnchor={{ x: 1, y: 0 }}
              delay={1200}
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

            <Annotation
              targetId="hero-squircle"
              targetAnchor={{ x: 0.9, y: -0.1 }}
              svgAnchor={{ x: 0, y: 1 }}
              delay={1600}
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
