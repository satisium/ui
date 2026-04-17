import { cn } from "@/lib/utils"
import Link from "next/link"
import * as React from "react"
import { CodeBlock } from "./code-block/code-block"
import { CommandBlock } from "./command-block"

export const defaultMdxComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mt-2 scroll-m-20 font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mt-12 mb-6 scroll-m-20 border-b border-border/50 pb-2 font-heading text-h2 font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mt-8 mb-4 scroll-m-20 font-heading text-h3 font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "mt-8 mb-4 scroll-m-20 font-heading text-h4 font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "font-body text-base leading-relaxed text-muted-foreground [&:not(:first-child)]:mt-6",
        className
      )}
      {...props}
    />
  ),
  a: ({
    className,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http")
    const Comp = isExternal ? "a" : Link
    return (
      <Comp
        href={href as string}
        className={cn(
          "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80",
          className
        )}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      />
    )
  },
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        "my-6 ml-6 list-disc text-muted-foreground marker:text-primary",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-6 ml-6 list-decimal text-muted-foreground", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className={cn("mt-2 font-body text-base", className)} {...props} />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded-md bg-muted px-[0.6rem] py-[0.2rem] font-mono text-sm font-medium text-primary/80",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        "mt-6 mb-4 overflow-x-auto rounded-xl border border-border bg-sidebar p-4 shadow-sm",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 border-primary pl-6 text-muted-foreground italic",
        className
      )}
      {...props}
    />
  ),
  CodeBlock,
  CommandBlock,
}
