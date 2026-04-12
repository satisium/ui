// registry/demos/fluid-switch-demo.tsx
"use client"

import * as React from "react"
import { FluidSwitch } from "@/registry/ui/fluid-switch"

export function FluidSwitchDemo() {
  const [checked, setChecked] = React.useState(false)
  return (
    <div className="flex items-center justify-center p-4">
      <FluidSwitch checked={checked} onCheckedChange={setChecked} />
    </div>
  )
}
