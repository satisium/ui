import React from "react"
import { Menu } from "lucide-react"
import { SatisiumLogo } from "@/components/satisium-logo" // Adjust path as needed

export function HeroSection() {
  return (
    // THE MOAT: Increased mobile padding so the "bezel" is intentional and confident.
    <section className="relative h-screen w-full bg-muted p-3 min-[400px]:p-4 sm:p-5 lg:p-6">
      {/* THE CANVAS: Plush geometry, zero borders, zero shadows. */}
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-background text-foreground sm:rounded-[2.5rem]">
        {/* --- TOP LAYER: HEADER --- */}
        <header className="relative z-10 flex w-full items-start justify-between p-6 sm:p-8 md:p-10">
          <div className="flex h-10 w-10 items-center justify-center sm:h-12 sm:w-12">
            <SatisiumLogo size="100%" />
          </div>

          <button
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-muted focus:bg-muted focus:outline-none sm:h-12 sm:w-12"
            aria-label="Open Menu"
          >
            <Menu
              className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:scale-95 sm:h-6 sm:w-6"
              strokeWidth={1.5}
            />
          </button>
        </header>

        {/* --- CENTER LAYER: ANCHOR --- */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
          {/* Increased mobile text size for a bolder, more confident presence */}
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground min-[400px]:text-4xl sm:text-5xl md:text-6xl">
            ui.satisium.com
          </h1>
        </div>

        {/* --- BOTTOM LAYER: FOOTER & CTA --- */}
        <footer className="relative z-10 flex w-full flex-col-reverse items-start justify-between gap-5 p-5 sm:flex-row sm:items-end sm:gap-6 sm:p-8 md:p-10">
          {/* Mobile: Row (Left & Right alignment). Desktop: Stacked Column (Left aligned). */}
          <div className="flex w-full flex-row items-center justify-between sm:w-auto sm:flex-col sm:items-start sm:justify-end sm:space-y-1">
            <h2 className="font-heading text-sm font-semibold tracking-wide text-foreground sm:text-base">
              25+ components
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Ever growing collection
            </p>
          </div>

          {/* Solid block button. Pure color intent. */}
          <button className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-6 py-4 font-heading text-sm font-medium text-background transition-transform duration-300 hover:scale-[1.02] focus:outline-none active:scale-[0.98] sm:w-auto sm:px-8">
            Explore components
          </button>
        </footer>
      </div>
    </section>
  )
}
