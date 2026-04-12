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
}`
