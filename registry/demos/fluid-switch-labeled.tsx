// registry/demos/fluid-switch-labeled.tsx
"use client"

import * as React from "react"
import { FluidSwitch } from "@/registry/ui/fluid-switch"

export function FluidSwitchLabeled() {
  const [checked, setChecked] = React.useState(true)
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-background p-4 shadow-sm">
      <FluidSwitch
        id="airplane-mode"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <div className="flex flex-col">
        <label
          htmlFor="airplane-mode"
          className="cursor-pointer leading-none font-medium text-[var(--text-sm)] text-foreground"
        >
          Airplane Mode
        </label>
        <span className="mt-1 text-[var(--text-caption)] text-muted-foreground">
          Disable all wireless connections.
        </span>
      </div>
    </div>
  )
}
