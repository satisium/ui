import React from "react"
import { cn } from "@/lib/utils"

interface IconProps extends React.SVGProps<SVGSVGElement> {}

// --- Package Manager Icons ---
export const NpmIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
  </svg>
)

export const PnpmIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <path d="M0 0h7.5v7.5H0zm8.25 0h7.5v7.5h-7.5zm8.25 0H24v7.5h-7.5zM0 8.25h7.5v7.5H0zm8.25 0h7.5v7.5h-7.5zm8.25 0H24v7.5h-7.5zM0 16.5h7.5V24H0zm8.25 0h7.5V24h-7.5z" />
  </svg>
)

export const YarnIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <path d="M14.288 1.95A4.6 4.6 0 0117.5 0c2.485 0 4.5 2.015 4.5 4.5 0 2.458-1.972 4.453-4.425 4.498L17.5 9h-3.238l.026-7.05zm-4.576 0l.026 7.05H6.5c-.033 0-6.5-.065-6.5 4.5C0 15.985 2.015 18 4.5 18c2.458 0 4.453-1.972 4.498-4.425L9.025 13.5h3.262l-.025 7.05A4.6 4.6 0 0015.5 24c2.485 0 4.5-2.015 4.5-4.5 0-2.458-1.972-4.453-4.498-4.425L15.474 15h-3.262l.025-7.05a4.6 4.6 0 00-3.212-4.425 4.602 4.602 0 00-5.788 3.425C3.237 6.95 5.252 8.965 7.737 8.965h3.238l-.026-7.05a4.6 4.6 0 013.239-4.425V1.95z" />
  </svg>
)

export const BunIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("h-4 w-4", className)}
    {...props}
  >
    <path d="M15.44.02C12.1-.28 8.89.65 6.46 2.53 3.51 4.81 1.76 8.35 1.76 12.01c0 3.79 1.83 7.35 4.88 9.53 2.58 1.85 5.86 2.72 9.21 2.38 5.76-.58 10.27-5.59 10.27-11.4 0-5.91-4.66-10.99-10.68-12.5zM12 18.5A6.5 6.5 0 1112 5.5a6.5 6.5 0 010 13z" />
  </svg>
)

// --- File Extension Icons ---
export const ReactIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="-11.5 -10.23174 23 20.46348"
    fill="currentColor"
    className={className}
    {...props}
  >
    <circle cx="0" cy="0" r="2.05" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
)

export const TSIcon = ({ className, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M1.5 0h21A1.5 1.5 0 0124 1.5v21a1.5 1.5 0 01-1.5 1.5h-21A1.5 1.5 0 010 22.5v-21A1.5 1.5 0 011.5 0zm11.23 18.06c1.17 0 2.22-.3 3.16-.91v-1.63c-.88.6-1.85.9-2.92.9-1.38 0-2.07-.63-2.07-1.89v-6.31H9.28v6.7c0 2.09 1.07 3.14 3.45 3.14zm5.82 0c2.18 0 3.65-1.12 3.65-3.32 0-2.31-1.44-3.15-3.5-3.48-1.56-.25-2.06-.57-2.06-1.17 0-.58.53-.98 1.4-.98 1.02 0 1.99.34 2.87.97V8.52a6.43 6.43 0 00-3.08-.73c-2.02 0-3.51 1.03-3.51 3.2 0 2.14 1.45 3 3.51 3.32 1.63.26 2.06.63 2.06 1.25 0 .68-.62 1.05-1.53 1.05-1.16 0-2.2-.42-3.1-1.14v1.66c.94.66 2.09 1.02 3.29 1.02z" />
  </svg>
)

// Fallback Icon
export const DefaultFileIcon = ({ className, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)
