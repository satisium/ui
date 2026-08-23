"use client"

import { SatisiumLogo } from "@/components/satisium-logo"

export default function FreedomDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-hidden p-6">
      <button className="group flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80 focus-visible:outline-none active:scale-95 sm:gap-4 md:gap-6 lg:gap-8">
        {/* LOGO: Scales smoothly from 48px to 128px */}
        <div className="flex size-12 shrink-0 items-center justify-center sm:size-16 md:size-24 lg:size-32">
          <SatisiumLogo size="100%" />
        </div>

        {/* TEXT: Scales smoothly alongside the logo */}
        <div className="flex items-start">
          <span className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-8xl">
            Satisium UI
          </span>
        </div>
      </button>
    </div>
  )
}
