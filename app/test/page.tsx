"use client"

import { CodeBlock } from "@/components/code-block/code-block"
import { CommandBlock } from "@/components/command-block"
import DiagonalHeroSection from "@/registry/demos/gliding-card/demo-three"
import HeroSection from "@/registry/demos/gliding-card/demo-two"

export default function SatisUIDemoPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto w-full space-y-24">
        {/* --- Header --- */}
        {/* <header className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            v2.0 Architecture
          </div>
          <h1 className="font-display text-display-sm tracking-tight md:text-display">
            Code Block Engine
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A developer-first, interactive syntax highlighter. Features focus
            modes, visual diffing, terminal emulation, and seamless IDE-like
            file trees.
          </p>
        </header> */}

        {/* --- Section 1: Command Block Demo --- */}
        <section className="space-y-6">
          <HeroSection />
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              1. Installation & CLI
            </h2>
            <p className="text-muted-foreground">
              Dedicated terminal blocks for installation instructions. Supports
              package manager toggling.
            </p>
          </div>

          <CommandBlock cli="satis-ui add button" title="fluid-switch" />
          <CommandBlock pkg="motion lucide-react clsx tailwind-merge" />
        </section>

        {/* --- Section 2: Visual Diffing (Add/Remove) --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              2. Visual Diffing (Step-by-Step)
            </h2>
            <p className="text-muted-foreground">
              Perfect for tutorials. Show exactly what lines to add or remove
              using{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                addLines
              </code>{" "}
              and{" "}
              <code className="rounded bg-destructive/10 px-1 py-0.5 text-destructive">
                removeLines
              </code>
              .
            </p>
          </div>

          <CodeBlock
            files={{
              "middleware.ts": {
                language: "typescript",
                code: `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  
  if (!token) {
    return NextResponse.rewrite(new URL('/login', request.url))
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}`,
                removeLines: [8],
                addLines: [9],
              },
            }}
          />
        </section>

        {/* --- Section 3: Focus Mode & Context Highlighting --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              3. Focus Mode & Highlighting
            </h2>
            <p className="text-muted-foreground">
              Reduce cognitive load by dimming boilerplate code. Pass{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                focusOnly: true
              </code>{" "}
              to blur everything except your{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                highlightLines
              </code>
              . Hover over the blurred text to reveal it.
            </p>
          </div>

          <CodeBlock
            files={{
              "app/api/route.ts": {
                language: "typescript",
                code: `import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const headersList = headers()
  const referer = headersList.get('referer')

  // This is the important part we want to focus on:
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP'
  const userAgent = headersList.get('user-agent')

  return NextResponse.json({ 
    ip, 
    userAgent, 
    referer 
  })
}`,
                highlightLines: [8, 9, 10],
                focusOnly: true,
              },
            }}
          />
        </section>

        {/* --- Section 4: Terminal Emulation Mode --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              4. Terminal Emulation Mode
            </h2>
            <p className="text-muted-foreground">
              When the language is set to{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                bash
              </code>{" "}
              or{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                sh
              </code>
              , line numbers are replaced with an un-copyable{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                $
              </code>{" "}
              prompt.
            </p>
          </div>

          <CodeBlock
            files={{
              "deploy.sh": {
                language: "bash",
                code: `# Build the Next.js application
npm run build

# Deploy to Vercel production environment
vercel deploy --prod

# Output success
echo "Deployment successful! URL copied to clipboard."`,
              },
            }}
          />
        </section>

        {/* --- Section 5: Expand / Collapse (Large Files) --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              5. Expandable Blocks
            </h2>
            <p className="text-muted-foreground">
              Prevent massive configuration files from taking up the entire
              screen. Set{" "}
              <code className="rounded bg-primary/10 px-1 py-0.5 text-primary">
                expandable={`{true}`}
              </code>{" "}
              to activate the glass-morphic "Show more" overlay.
            </p>
          </div>

          <CodeBlock
            expandable={true}
            files={{
              "tailwind.config.ts": {
                language: "typescript",
                code: `import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content:[
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config`,
              },
            }}
          />
        </section>

        {/* --- Section 6: IDE / Multi-File Mode --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              6. IDE File Tree Engine
            </h2>
            <p className="text-muted-foreground">
              Pass multiple paths to automatically render an interactive, nested
              sidebar. Includes responsive mobile sheets and layout animations.
            </p>
          </div>

          <CodeBlock
            height={"600px"}
            files={{
              "hooks/use-media-query.ts": {
                language: "typescript",
                code: `import * as React from "react"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}`,
              },
              "components/ui/dialog.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ui/dialoga.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ui/a/dialogb.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ui/dialogc.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ab/dialoga.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ui/index.ts": {
                language: "typescript",
                code: `export * from "./button"
export * from "./dialog"
export * from "./input"
export * from "./label"`,
              },
              "package.json": {
                language: "json",
                addLines: [6],
                code: `{
  "name": "project",
  "version": "0.1.0",
  "dependencies": {
    "react": "^18",
    "lucide-react": "latest",
    "@radix-ui/react-dialog": "^1.0.5"
  }
}`,
              },
              "components/ad/dialogaaaaaaaaaaaaaaaaaaa.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
              "components/ac/dialoga.tsx": {
                language: "tsx",
                highlightLines: [4, 5],
                code: `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// ... rest of the component`,
              },
            }}
          />
        </section>
      </div>
    </div>
  )
}
