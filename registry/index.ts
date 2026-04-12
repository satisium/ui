import dynamic from "next/dynamic"

export interface RegistryItem {
  name: string
  component: React.ComponentType
  installCommand: string
  getUsageCode: () => Promise<string>
}

export const registry: Record<string, RegistryItem> = {
  "fluid-switch-demo": {
    name: "Default",
    component: dynamic(() =>
      import("@/registry/demos/fluid-switch-demo").then(
        (m) => m.FluidSwitchDemo
      )
    ),
    installCommand:
      "npx shadcn@latest add https://satis-ui.com/r/fluid-switch.json",
    getUsageCode: async () => {
      const mod = await import("@/registry/strings/fluid-switch")
      return mod.fluidSwitchDemoString
    },
  },
  "fluid-switch-labeled": {
    name: "With Label",
    component: dynamic(() =>
      import("@/registry/demos/fluid-switch-labeled").then(
        (m) => m.FluidSwitchLabeled
      )
    ),
    installCommand:
      "npx shadcn@latest add https://satis-ui.com/r/fluid-switch.json",
    getUsageCode: async () => {
      const mod = await import("@/registry/strings/fluid-switch")
      return mod.fluidSwitchLabeledString
    },
  },
}
