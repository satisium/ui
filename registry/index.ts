import { CodeFile } from "@/components/code-block/types"
import dynamic from "next/dynamic"

export interface RegistryItem {
  name: string
  type?: "react" | "video" | "image"
  component?: React.ComponentType
  installCommand?: string
  getFiles?: () => Promise<Record<string, CodeFile | string>>
  previewUrl?: string
  mediaUrl?: string
}

export const registry: Record<string, RegistryItem> = {
  "fluid-switch-demo": {
    name: "Demo 1",
    type: "react",
    previewUrl: "https://preview.satisui.xyz/fluid-switch/demo-1", // Unique URL 1

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
    name: "Demo 2",
    type: "react",
    previewUrl: "https://preview.satisui.xyz/fluid-switch/demo-2", // Unique URL 1

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
  "dashboard-pro-desktop": {
    name: "Desktop Layout",
    type: "video",
    mediaUrl: "/videos/dashboard-desktop-preview.mp4",
    previewUrl: "https://preview.satisui.xyz/dashboard-pro/desktop",
  },
  "dashboard-pro-mobile": {
    name: "Mobile Layout",
    type: "image",
    mediaUrl: "/images/dashboard-mobile-preview.webp",
    previewUrl: "https://preview.satisui.xyz/dashboard-pro/mobile",
  },
}
