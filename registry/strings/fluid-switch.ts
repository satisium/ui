// registry/strings/fluid-switch.ts

export const fluidSwitchDemoString = `"use client";

import * as React from "react";
import { FluidSwitch } from "@/components/ui/fluid-switch";

export default function MyComponent() {
  const[checked, setChecked] = React.useState(false);

  return (
    <FluidSwitch 
      checked={checked} 
      onCheckedChange={setChecked} 
    />
  );
}`
export const fluidSwitchLabeledString = `"use client";

import * as React from "react";
import { FluidSwitch } from "@/components/ui/fluid-switch";

export default function LabeledSwitch() {
  const[checked, setChecked] = React.useState(true);

  return (
    <div className="flex items-center gap-3">
      <FluidSwitch 
        id="airplane-mode" 
        checked={checked} 
        onCheckedChange={setChecked} 
      />
      <div className="flex flex-col">
        <label htmlFor="airplane-mode" className="text-sm font-medium">
          Airplane Mode
        </label>
        <span className="text-xs text-muted-foreground mt-1">
          Disable all wireless connections.
        </span>
      </div>
    </div>
  );
  export default function LabeledSwitch() {
  const[checked, setChecked] = React.useState(true);

  return (
    <div className="flex items-center gap-3">
      <FluidSwitch 
        id="airplane-mode" 
        checked={checked} 
        onCheckedChange={setChecked} 
      />
      <div className="flex flex-col">
        <label htmlFor="airplane-mode" className="text-sm font-medium">
          Airplane Mode
        </label>
        <span className="text-xs text-muted-foreground mt-1">
          Disable all wireless connections.
        </span>
      </div>
    </div>
  );
  export default function LabeledSwitch() {
  const[checked, setChecked] = React.useState(true);

  return (
    <div className="flex items-center gap-3">
      <FluidSwitch 
        id="airplane-mode" 
        checked={checked} 
        onCheckedChange={setChecked} 
      />
      <div className="flex flex-col">
        <label htmlFor="airplane-mode" className="text-sm font-medium">
          Airplane Mode
        </label>
        <span className="text-xs text-muted-foreground mt-1">
          Disable all wireless connections.
        </span>
      </div>
    </div>
  );
  export default function LabeledSwitch() {
  const[checked, setChecked] = React.useState(true);

  return (
    <div className="flex items-center gap-3">
      <FluidSwitch 
        id="airplane-mode" 
        checked={checked} 
        onCheckedChange={setChecked} 
      />
      <div className="flex flex-col">
        <label htmlFor="airplane-mode" className="text-sm font-medium">
          Airplane Mode
        </label>
        <span className="text-xs text-muted-foreground mt-1">
          Disable all wireless connections.
        </span>
      </div>
    </div>
  );
}`

export const fluidSwitchString = `"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface FluidSwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const FluidSwitch = React.forwardRef<
  HTMLButtonElement,
  FluidSwitchProps
>(({ checked, onCheckedChange, className, disabled, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      ref={ref}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <motion.div
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 500, damping: 30, mass: 1 }}
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
          checked ? "ml-5" : "ml-0"
        )}
      >
        <motion.div
          className="h-full w-full rounded-full bg-transparent"
          whileTap={{ scale: disabled ? 1 : 0.85 }}
        />
      </motion.div>
    </button>
  )
})

FluidSwitch.displayName = "FluidSwitch"`

export const fluidSwitchFile = {
  "fluid-switch-labeled.tsx": {
    code: fluidSwitchString,
    language: "tsx",
  },
  "fluid-switch.tsx": {
    code: fluidSwitchDemoString,
    language: "tsx",
  },
}
