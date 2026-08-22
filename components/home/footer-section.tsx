"use client"

import { SatisiumLogo } from "@/components/satisium-logo"
import { Badge } from "@/components/ui/badge"
import {
  DiscordIcon,
  InstagramIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import { ExploreActionGroup } from "./explore-action-group"
import { KineticHaloRing } from "./kinetic-halo-ring"

export function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    // OUTER MOAT
    <section className="relative h-screen w-full bg-muted px-3 pt-3 min-[400px]:px-4 min-[400px]:pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
      {/* INNER CANVAS */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-[2rem] bg-none text-foreground sm:rounded-t-[2.5rem]">
        {/* --- TOP 40%: THE QUIET ZONE --- */}
        <div className="relative flex w-full flex-[4] flex-col justify-between px-3.5 pt-3 pb-4 sm:px-5 sm:pb-5 lg:px-6">
          {/* Centered CTA */}
          <div className="flex flex-1 items-center justify-center py-2 sm:py-0">
            <ExploreActionGroup
              exploreText="Explore components"
              repo="satisium/ui"
            />
          </div>

          {/* THE LEDGE */}
          <div className="relative z-10 flex w-full items-end justify-between">
            {/* 
              LEFT GROUP (Always Top): 
              On Mobile: Spreads across the full width (Brand left, Icons right).
              On Desktop: Packs tightly to the left.
            */}
            <div className="flex w-full items-center justify-between sm:w-auto sm:justify-start sm:gap-3.5">
              {/* Clickable Brand */}
              <button
                onClick={scrollToTop}
                className="group flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-none active:scale-[0.98] sm:gap-3"
                aria-label="Scroll to top"
              >
                <div className="flex h-7 w-7 items-center justify-center sm:h-9 sm:w-9">
                  <SatisiumLogo size="100%" />
                </div>

                <div className="flex items-start">
                  <span className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg lg:text-xl">
                    Satisium UI
                  </span>
                  <Badge className="-mt-0.5 ml-1.5 h-4 rounded-[4px] border-none bg-primary px-1 text-[9px] font-semibold text-primary-foreground sm:h-[18px] sm:px-1.5 sm:text-[10px]">
                    Beta
                  </Badge>
                </div>
              </button>

              {/* Vertical Divider (Desktop Only) */}
              <div className="hidden h-4 w-[1px] bg-border/60 sm:block" />

              {/* Project Social Icons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <a
                  href="https://x.com/satisiumui"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Satisium UI on X"
                  className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
                >
                  <HugeiconsIcon icon={NewTwitterIcon} size={16} />
                </a>

                <a
                  href="https://github.com/satisium/ui"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Satisium UI on GitHub"
                  className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
                >
                  <Image
                    src="/github-mark-white.svg"
                    alt="GitHub"
                    width={16}
                    height={16}
                    className="object-contain"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://discord.gg/satisium"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Satisium Discord"
                  className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
                >
                  <HugeiconsIcon icon={DiscordIcon} size={16} />
                </a>
              </div>
            </div>

            {/* RIGHT GROUP (Desktop Only): Rendered on the Ledge */}
            <AttributionBlock className="hidden sm:flex" />
          </div>
        </div>

        {/* --- BOTTOM 60%: THE KINETIC CAGE & MOBILE FOOTER --- */}
        <div className="relative flex w-full flex-[6] shrink-0 flex-col p-3 min-[400px]:p-4 sm:p-5 lg:p-6">
          <div
            className="relative isolate w-full flex-1 transform-gpu overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
            style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
          >
            <div className="absolute inset-0 z-0">
              <KineticHaloRing
                character="O"
                size={0.03}
                spacing={0.02}
                columns={40}
                rows={120}
                staggerMultiplier={0}
                floorY={-0.4}
                tiltZ={2}
                bowlStrength={0}
                autoRotate={true}
                autoRotateSpeedY={0.06}
                autoRotateSpeedX={0.04}
                scrollSensitivity={0.0002}
                damping={0.01}
                maxSpeed={25.0}
                stretchMultiplier={4}
                fovWarp={1000}
                chromaticAberration={0}
                grayscaleOnDrag={0}
                shadowIntensity={0}
                fadeFar={800.0}
                waveAberration={0.15}
                color="#717171"
                accentColor="#fff"
                enableRipple={true}
                rippleSpeed={0.3}
                rippleThickness={0.008}
                rippleZBump={0.15}
                autoRipple={true}
                autoRippleDelay={1}
                className="bg-foreground dark:bg-background"
              />
            </div>
          </div>

          {/* RIGHT GROUP (Mobile Only): Rendered beautifully below the ring */}
          <AttributionBlock className="mt-3 flex min-[400px]:mt-4 sm:hidden" />
        </div>
      </div>
    </section>
  )
}

// ==========================================
// REUSABLE ATTRIBUTION BLOCK
// ==========================================
function AttributionBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex w-full items-center justify-between sm:w-auto sm:justify-end sm:gap-4 ${className}`}
    >
      <span className="font-heading text-xs tracking-wide text-muted-foreground">
        Made by{" "}
        <a
          href="https://x.com/iamsatish4564"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground transition-opacity hover:opacity-70"
        >
          Satishkumar
        </a>
      </span>

      {/* Personal Social Icons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <a
          href="https://x.com/iamsatish4564"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Author X"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
        >
          <HugeiconsIcon icon={NewTwitterIcon} size={16} />
        </a>
        <a
          href="https://instagram.com/iamsatish4564"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Author Instagram"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
        >
          <HugeiconsIcon icon={InstagramIcon} size={16} />
        </a>
        <a
          href="https://github.com/iamsatish4564"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Author GitHub"
          className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-foreground text-background transition-opacity hover:opacity-90 sm:h-9 sm:w-9 sm:rounded-[14px] dark:bg-secondary dark:text-foreground"
        >
          <Image
            src="/github-mark-white.svg"
            alt="GitHub"
            width={16}
            height={16}
            className="object-contain"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  )
}
