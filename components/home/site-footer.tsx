import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t py-12 md:py-16">
      <div className="container mx-auto flex flex-col gap-12 px-8 md:flex-row md:justify-between lg:px-16 xl:px-64">
        <div className="flex max-w-xs flex-col gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight"
          >
            <span>Satisium UI</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Animated component library for design engineers. Built with Tailwind
            v4, Framer Motion and GSAP for Shadcn UI.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Getting Started
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/docs/getting-started/introduction"
                  className="transition-colors hover:text-foreground"
                >
                  Introduction
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/setup"
                  className="transition-colors hover:text-foreground"
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/how-to-use"
                  className="transition-colors hover:text-foreground"
                >
                  How to Use
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Library
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/docs/components"
                  className="transition-colors hover:text-foreground"
                >
                  Components
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/blocks"
                  className="transition-colors hover:text-foreground"
                >
                  Blocks
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/templates"
                  className="transition-colors hover:text-foreground"
                >
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Socials
            </h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://x.com/iamsatish4564"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                   href="https://github.com/satisium-ui/ui"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
