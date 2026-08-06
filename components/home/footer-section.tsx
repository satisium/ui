import React from "react"
import Image from "next/image" // Added for the GitHub SVG
import { SatisiumLogo } from "@/components/satisium-logo"
import { HugeiconsIcon } from "@hugeicons/react"
import { NewTwitterIcon, InstagramIcon } from "@hugeicons/core-free-icons"
import { InfiniteHaloRing } from "./footer-halo-ring"

export function FooterSection() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    <section className="relative h-screen w-full bg-muted p-3 min-[400px]:p-4 sm:p-5 lg:p-6">
      <div
        // FIX 1: Added `transform-gpu` and `isolate` to force a strict hardware layer
        className="relative isolate flex h-full w-full transform-gpu flex-col justify-end overflow-hidden rounded-[2rem] bg-background text-foreground sm:rounded-[2.5rem]"
        style={{
          // FIX 2: The ultimate hack for border-radius sub-pixel bleeding
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
        }}
      >
        {/* --- 1. THE ENGINE (Background) --- */}
        <div className="absolute inset-0 z-0">
          <InfiniteHaloRing
            images={images}
            cardWidthRatio={0.16}
            cardAspectRatio={1.2}
            gapMultiplier={0.025}
            columns={20}
            rows={40}
            staggerMultiplier={0.5}
            floorY={-1.5}
            bowlStrength={0.03}
            autoRotate={true}
            autoRotateSpeedY={2.0}
            scrollSensitivity={0.025}
            damping={0.03}
            maxSpeed={25.0}
            stretchMultiplier={0.1}
            fovWarp={30.5}
            parallaxMultiplier={0}
            chromaticAberration={0.015}
            grayscaleOnDrag={0.8}
            shadowIntensity={0.5}
            fadeFar={30.0}
            squirclePower={4.0}
            cornerRadius={0.5}
            borderWidth={0}
          />
        </div>

        {/* --- 2. PROGRESSIVE BLUR (The Glass) --- */}
        <div
          className="pointer-events-none absolute -right-5 -bottom-5 -left-5 z-10 h-[45vh] backdrop-blur-2xl"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 10%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 10%, transparent 100%)",
          }}
        />
        <div className="pointer-events-none absolute -right-5 -bottom-5 -left-5 z-10 h-[45vh] bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

        {/* --- 3. FOREGROUND CONTENT --- */}
        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 p-6 sm:flex-row sm:p-8 md:p-10">
          {/* Left: Branding */}
          <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start sm:gap-4">
            <div className="flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
              <SatisiumLogo size="100%" />
            </div>
            <span className="font-heading text-sm font-semibold tracking-wide text-foreground">
              Satisium UI
            </span>
          </div>

          {/* Right: Signature & Socials */}
          <div className="flex w-full items-center justify-center gap-4 sm:w-auto sm:justify-end sm:gap-6">
            {/* The Signature */}
            <span className="font-heading text-xs tracking-wide text-muted-foreground">
              Made by{" "}
              <a
                href="https://x.com/iamsatish4564" // Replaced with your Twitter!
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition-opacity hover:opacity-70"
              >
                Satishkumar
              </a>
            </span>

            {/* The Squircle Social Icons */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="X (Twitter)"
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-10 sm:w-10 dark:bg-background dark:text-foreground"
              >
                <HugeiconsIcon icon={NewTwitterIcon} size={18} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-10 sm:w-10 dark:bg-background dark:text-foreground"
              >
                <HugeiconsIcon icon={InstagramIcon} size={18} />
              </a>

              {/* UPDATED GITHUB LOGO */}
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-10 sm:w-10 dark:bg-background dark:text-foreground"
              >
                {/* 
                  Because the button background is always dark, 
                  we exclusively use the white SVG. 
                */}
                <Image
                  src="/github-mark-white.svg"
                  alt="GitHub"
                  width={18}
                  height={18}
                  className="object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
