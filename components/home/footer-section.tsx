"use client"

import React from "react"
import Image from "next/image"
import { SatisiumLogo } from "@/components/satisium-logo"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  NewTwitterIcon,
  InstagramIcon,
  DiscordIcon,
} from "@hugeicons/core-free-icons"
import { InfiniteHaloRing } from "./footer-halo-ring"
import { ExploreActionGroup } from "./explore-action-group"
import { Badge } from "@/components/ui/badge"

export function FooterSection() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    // OUTER MOAT
    <section className="relative h-screen w-full bg-muted px-3 pt-3 min-[400px]:px-4 min-[400px]:pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pt-6">
      {/* INNER CANVAS */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-[2rem] bg-background text-foreground sm:rounded-t-[2.5rem]">
        {/* --- TOP 40%: THE QUIET ZONE --- */}
        <div className="relative flex w-full flex-[4] flex-col justify-between px-3.5 pt-3 pb-4 sm:px-5 sm:pb-5 lg:px-6">
          {/* Centered CTA: Dynamic flex-1 prevents collision with the ledge */}
          <div className="flex flex-1 items-center justify-center py-2 sm:py-0">
            <ExploreActionGroup
              exploreText="Explore components"
              repo="satisium/ui"
            />
          </div>

          {/* THE LEDGE: 2 Balanced Rows on Mobile, 1 Unified Row on Desktop */}
          <div className="relative z-10 flex w-full flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            {/* ROW 1 (Mobile) / LEFT GROUP (Desktop): Satisium Brand + Project Socials */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-3.5">
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

            {/* ROW 2 (Mobile) / RIGHT GROUP (Desktop): Attribution + Personal Socials */}
            <div className="flex items-center justify-between border-t border-border/20 pt-2 sm:justify-end sm:gap-4 sm:border-0 sm:pt-0">
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
          </div>
        </div>

        {/* --- BOTTOM 60%: THE KINETIC CAGE --- */}
        <div className="relative w-full flex-[6] shrink-0 px-3 min-[400px]:px-4 sm:px-5 lg:px-6">
          <div
            className="relative isolate h-full w-full transform-gpu overflow-hidden rounded-t-[1.5rem] bg-muted sm:rounded-t-[2rem]"
            style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
          >
            <div className="absolute inset-0 z-0">
              <InfiniteHaloRing
                images={images}
                cardWidthRatio={0.3}
                cardAspectRatio={1}
                gapMultiplier={0.025}
                columns={20}
                rows={20}
                staggerMultiplier={0.5}
                floorY={-5.5}
                bowlStrength={0.03}
                autoRotate={true}
                autoRotateSpeedY={2.0}
                scrollSensitivity={0.025}
                damping={0.03}
                maxSpeed={25.0}
                stretchMultiplier={-0.1}
                fovWarp={50.5}
                parallaxMultiplier={0}
                chromaticAberration={0.015}
                grayscaleOnDrag={0.08}
                shadowIntensity={0.5}
                fadeFar={80.0}
                squirclePower={4.0}
                cornerRadius={0.2}
                borderWidth={0}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
