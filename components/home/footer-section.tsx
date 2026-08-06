import React from "react"
import Image from "next/image"
import { SatisiumLogo } from "@/components/satisium-logo"
import { HugeiconsIcon } from "@hugeicons/react"
import { NewTwitterIcon, InstagramIcon } from "@hugeicons/core-free-icons"
import { InfiniteHaloRing } from "./footer-halo-ring"
import { ExploreActionGroup } from "./explore-action-group"

export function FooterSection() {
  const images = Array.from({ length: 18 }).map(
    (_, i) =>
      `https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_800/v1781471531/ui-v3/demos/images/${15 + i}.jpg`
  )

  return (
    // OUTER MOAT: Continues the frame from the rest of the site
    <section className="relative h-screen w-full bg-muted px-3 pt-3 min-[400px]:px-4 sm:px-5 lg:px-6 min-[400px]:pt-4 sm:pt-5 lg:pt-6">
      
      {/* INNER CANVAS: Zero borders, zero shadows. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-t-[2rem] bg-background text-foreground sm:rounded-t-[2.5rem]">
        
        {/* --- TOP 40%: THE QUIET ZONE --- */}
        {/* We use padding (px-x) here so the ledge perfectly aligns with the cage below it */}
        <div className="relative flex w-full flex-[4] flex-col justify-end px-3 pb-4 min-[400px]:px-4 sm:px-5 lg:px-6">
          
          {/* Centered CTA */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* <button className="pointer-events-auto inline-flex items-center justify-center rounded-[16px] bg-foreground px-8 py-4 font-heading text-sm font-medium text-background ">
              Explore components
            </button> */}
            <ExploreActionGroup
      exploreText="Explore components" 
      repo="shadcn-ui/ui" 
    />
          </div>

          {/* THE LEDGE: Branding & Socials */}
          <div className="relative z-10 flex w-full items-end justify-between">
            
            {/* Left: Branding */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-8 w-8 items-center justify-center sm:h-10 sm:w-10">
                <SatisiumLogo size="100%" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Satisium UI
              </span>
            </div>

            {/* Right: Signature & Social Squircles */}
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="hidden font-heading text-xs tracking-wide text-muted-foreground md:inline-block">
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

              <div className="flex items-center gap-2">
                <a
                  href="#"
                  aria-label="X (Twitter)"
                  // INTELLIGENT DARK MODE: bg-secondary relies purely on luminance contrast to define the shape. Zero borders.
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 dark:bg-secondary dark:text-foreground sm:h-11 sm:w-11"
                >
                  <HugeiconsIcon icon={NewTwitterIcon} size={20} />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 dark:bg-secondary dark:text-foreground sm:h-11 sm:w-11"
                >
                  <HugeiconsIcon icon={InstagramIcon} size={20} />
                </a>
                <a
                  href="#"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 hover:scale-105 active:scale-95 dark:bg-secondary dark:text-foreground sm:h-11 sm:w-11"
                >
                  {/* Standard GitHub mark works flawlessly here because the squircle background is dark in both themes */}
                  <Image
                    src="/github-mark-white.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* --- BOTTOM 60%: THE KINETIC CAGE --- */}
        <div className="relative w-full flex-[6] shrink-0 px-3 min-[400px]:px-4 sm:px-5 lg:px-6">
          
          <div 
            // Flush bottom: rounded-t only. overflow-hidden of the parent handles the bottom curve perfectly.
            className="relative h-full w-full overflow-hidden rounded-t-[1.5rem] bg-muted sm:rounded-t-[2rem] isolate transform-gpu"
            style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }} 
          >
            
            {/* The 3D Engine: Pure Viewport */}
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