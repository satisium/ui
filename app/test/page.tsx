"use client"

import { CodeBlock } from "@/components/code-block"
import { CommandBlock } from "@/components/command-block"

export default function SatisUIDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground md:p-24">
      <div className="mx-auto max-w-4xl space-y-16">
        {/* --- Header --- */}
        <header className="space-y-4">
          <h1 className="font-display text-display-sm tracking-tight md:text-display">
            Button Component
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Displays a button or a component that looks like a button. Features
            Apple-style micro-interactions and intent-driven design.
          </p>
        </header>

        {/* --- Section 1: Command Block Demo --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              1. Installation
            </h2>
            <p className="text-muted-foreground">
              Run the following CLI command to add the button to your project.
              Notice how changing the package manager updates globally.
            </p>
          </div>

          {/* CLI Command Example */}
          <CommandBlock cli="satis-ui add button" />

          <p className="mt-4 text-muted-foreground">
            Or manually install the required dependencies:
          </p>

          {/* Package Command Example */}
          <CommandBlock pkg="framer-motion lucide-react clsx tailwind-merge" />
        </section>

        {/* --- Section 2: Code Block (Single File Demo) --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              2. Usage (Single File)
            </h2>
            <p className="text-muted-foreground">
              When passing only one file, the sidebar elegantly disappears to
              reduce cognitive load.
            </p>
          </div>

          <CodeBlock
            files={{
              "app/page.tsx": {
                language: "tsx",
                code: `import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button variant="default" size="lg">
        Click me
      </Button>
    </main>
  );
}`,
              },
            }}
          />
        </section>

        {/* --- Section 3: Code Block (Multi-File / IDE Demo) --- */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-heading text-h4 tracking-tight">
              3. Manual Architecture (IDE Mode)
            </h2>
            <p className="text-muted-foreground">
              A deeply nested structure parses automatically. Notice the smooth
              height morphing, the smart folder collapse, and the active pill
              layout animations.
            </p>
          </div>

          <CodeBlock
            maxHeight="400px" // Triggers the sleek expand/collapse gradient
            files={{
              "src/components/ui/button.tsx": {
                language: "tsx",
                code: `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
              },
              "src/lib/utils.ts": {
                language: "typescript",
                code: `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
              },
              "tailwind.config.ts": {
                language: "typescript",
                code: `import type { Config } from "tailwindcss"

const config = {
  darkMode:["class"],
  content:[
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config`,
              },
              "package.json": {
                language: "json",
                code: `{
  "name": "satis-ui",
  "version": "1.0.0",
  "description": "Awwwards tier UI components",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.300.0",
    "shiki": "^1.0.0",
    "zustand": "^4.5.0"
  }
}`,
              },
            }}
          />
        </section>
      </div>
    </div>
  )
}
