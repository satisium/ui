// Design system reminder: Shared Satisium UI grammar — neutral app shell, large rounded surfaces and minimal utility chrome.

import { BuildPlanDialog } from "@/components/studio/BuildPlanDialog";
import { LumenMark } from "@/components/studio/LumenMark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigation = [
  ["Showcase", "/showcase"],
  ["Services", "/services"],
  ["Journal", "/journal"],
  ["Contact", "/contact"],
] as const;

function StudioMark() {
  return <LumenMark className="size-11 text-foreground" />;
}

export function StudioShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen overflow-x-clip bg-muted text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="group flex items-center gap-3 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <StudioMark />
            <span className="font-sans leading-4 tracking-[-0.05em]">
              <strong className="block text-base font-extrabold">
                LUMEN HOUSE
              </strong>
              <span className="mt-0.5 block font-mono text-[8px] tracking-[0.16em] text-muted-foreground">
                PHOTOGRAPHY STUDIO
              </span>
            </span>
          </Link>
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navigation.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`font-sans text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${location === href ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span
            aria-hidden="true"
            className="hidden size-1.5 rounded-full bg-primary lg:block"
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-xl border-border lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[88%] rounded-l-[1.4rem] border-border bg-background p-0"
              side="right"
            >
              <SheetHeader className="border-b border-border p-6">
                <SheetTitle className="font-sans text-xl font-bold">
                  Lumen House
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col px-6 py-5"
              >
                {navigation.map(([label, href], index) => (
                  <SheetClose asChild key={href}>
                    <Link
                      href={href}
                      className="flex min-h-14 items-center justify-between border-b border-border font-sans text-xl font-bold outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span>{label}</span>
                      <span className="font-mono text-xs text-primary">
                        0{index + 1}
                      </span>
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto border-t border-border p-6">
                <BuildPlanDialog />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      {children}
      <footer className="mx-3 mb-3 rounded-[1.4rem] bg-foreground text-background sm:mx-5">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr] lg:px-12">
          <div>
            <p className="font-sans text-2xl font-bold tracking-tight">
              Lumen House
              <br />
              Lose the noise.
            </p>
          </div>
          <div className="font-sans text-xs leading-6 text-background/70">
            <p className="mb-2 tracking-[0.14em] text-primary uppercase">
              Studio
            </p>
            <p>Amsterdam · London · Anywhere light travels</p>
            <a
              href="mailto:studio@lumenhouse.example"
              className="mt-2 inline-block underline decoration-primary underline-offset-4 hover:text-background"
            >
              studio@lumenhouse.example
            </a>
          </div>
          <div className="flex flex-col justify-between font-sans text-xs leading-6 text-background/70">
            <p>© 2026 Lumen House Studio</p>
            <div className="mt-3">
              <BuildPlanDialog />
            </div>
            <a
              href="https://ui.satisium.com/docs/getting-started/skills"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-left text-[10px] text-background/70 no-underline outline-offset-4 transition-colors hover:text-background focus-visible:outline-2 focus-visible:outline-primary"
            >
              <img
                src="https://ui.satisium.com/favicon.ico"
                alt=""
                aria-hidden="true"
                className="size-5 rounded-sm"
              />
              <span>Designed with love using satisium-ui-skills</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
