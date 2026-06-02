"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { motion } from "motion/react"

export type ChangeType =
  | "feature"
  | "fix"
  | "improvement"
  | "breaking"
  | "refactor"

export const Changelog = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("mx-auto ml-0 w-full max-w-4xl py-10", className)}>
      <ul className="space-y-32">{children}</ul>
    </div>
  )
}

export const ChangelogEntry = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <li
      className={cn("relative grid gap-8 md:grid-cols-[12rem_1fr]", className)}
    >
      {/* 
        Removed the vertical line. 
        Relying purely on the grid layout and whitespace for a cleaner, Apple-like aesthetic. 
      */}
      {children}
    </li>
  )
}

export const ChangelogHeader = ({
  date,
  children,
  className,
}: {
  date: string
  children?: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        // Changed to top-[30vh] to stick exactly 30% from the top of the screen
        "flex items-center gap-2 pt-1 md:sticky md:top-[5vh] md:flex-col md:items-end md:gap-1 md:self-start md:pr-8 md:text-right",
        className
      )}
    >
      {/* 
        MDX h2 CSS Stripper:
        Changed !text-foreground to !text-primary for the version numbers.
      */}
      <div className="[&>h2]:!m-0 [&>h2]:!border-none [&>h2]:!pb-0 [&>h2]:!font-mono [&>h2]:!text-sm [&>h2]:!font-bold [&>h2]:!tracking-tight [&>h2]:!text-primary [&>h2>a]:!hidden">
        {children}
      </div>

      <time className="text-xs text-muted-foreground tabular-nums select-none">
        {date}
      </time>
    </div>
  )
}

export const ChangelogContent = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        "space-y-4",
        // Softened the h3 tags to reduce cognitive load:
        // Changed to text-base, font-medium, normal tracking, and slightly muted text color.
        "[&>h3]:!mb-3 [&>h3]:!text-base [&>h3]:!font-medium [&>h3]:!tracking-normal [&>h3]:!text-foreground/90 [&>h3:first-child]:!mt-0 [&>h3>a]:!hidden",
        "[&>p]:!mb-4 [&>p]:!text-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

const typeStyles: Record<ChangeType, { badge: string; label: string }> = {
  feature: {
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    label: "New",
  },
  fix: {
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "Fix",
  },
  improvement: {
    badge:
      "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    label: "Improve",
  },
  breaking: {
    badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    label: "Breaking",
  },
  refactor: {
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    label: "Refactor",
  },
}

export const ChangelogItem = ({
  type,
  children,
}: {
  type: ChangeType
  children: React.ReactNode
}) => {
  const style = typeStyles[type] || typeStyles.feature

  return (
    <div className="group flex items-baseline gap-3">
      <Badge
        variant="outline"
        className={cn(
          "flex-shrink-0 translate-y-[1px] px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase",
          style.badge
        )}
      >
        {style.label}
      </Badge>
      <div className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
        {children}
      </div>
    </div>
  )
}

export const ChangelogImage = ({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) => (
  <div
    className={cn(
      "mt-4 overflow-hidden rounded-lg border border-border bg-muted/50",
      className
    )}
  >
    <img src={src} alt={alt} className="h-auto w-full object-cover" />
  </div>
)

export type ChangelogLinkItem = { name: string; href: string }

export const ChangelogComponentList = ({
  items,
  className,
}: {
  items: Array<string | ChangelogLinkItem>
  className?: string
}) => {
  return (
    <div
      className={cn("mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2", className)}
    >
      {items.map((item, index) => {
        const isLink = typeof item !== "string"
        const text = isLink ? item.name : item
        const baseStyles =
          "flex items-center gap-2 text-xs font-medium border rounded-md px-2.5 py-1.5 transition-colors"

        if (isLink) {
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                baseStyles,
                "border-border/50 bg-muted/50 text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-background active:scale-[0.98]"
              )}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
              {text}
            </Link>
          )
        }
        return (
          <div
            key={index}
            className={cn(
              baseStyles,
              "cursor-default border-border/40 bg-muted/30 text-muted-foreground"
            )}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            {text}
          </div>
        )
      })}
    </div>
  )
}
