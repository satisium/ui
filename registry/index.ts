import { CodeFile } from "@/components/code-block/code-block"
import dynamic from "next/dynamic"

export interface RegistryItem {
  name: string
  component: React.ComponentType
  installCommand: string

  getFiles: () => Promise<Record<string, CodeFile | string>>
}

export const registry: Record<string, RegistryItem> = {
  "fluid-switch-demo": {
    name: "Default",
    component: dynamic(() =>
      import("@/registry/demos/fluid-switch-demo").then(
        (m) => m.FluidSwitchDemo
      )
    ),
    installCommand: "https://satis-ui.com/r/fluid-switch.json",
    getFiles: async () => {
      // Dynamically import the raw strings to keep bundle size small
      const mod = await import("@/registry/strings/fluid-switch")

      return {
        // The key acts as the filename in the CodeBlock tree sidebar
        "fluid-switch-demo.tsx": {
          code: mod.fluidSwitchDemoString,
          language: "tsx", // Optional: CodeBlock infers this from the extension
        },
      }
    },
  },
  "fluid-switch-labeled": {
    name: "With Label",
    component: dynamic(() =>
      import("@/registry/demos/fluid-switch-labeled").then(
        (m) => m.FluidSwitchLabeled
      )
    ),
    installCommand: "https://satis-ui.com/r/fluid-switch.json",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-switch")

      return {
        "fluid-switch-labeled.tsx": {
          code: mod.fluidSwitchLabeledString,
          language: "tsx",
        },
      }
    },
  },
}
