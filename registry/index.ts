import { CodeFile } from "@/components/code-block/types"
import dynamic from "next/dynamic"

/**
 * Defines a component available in the Satis UI registry.
 */
export interface RegistryItem {
  /** The display name of the component demo */
  name: string
  /** The asset type: React code, pre-recorded video, or static image */
  type?: "react" | "video" | "image"
  /**
   * ✨ HYBRID ARCHITECTURE FLAG ✨
   * "direct" (Default) - Renders directly in the DOM. Fastest. Best for simple components.
   * "iframe" - Renders via the /embed route. Best for responsive layouts requiring media queries.
   */
  renderMode?: "direct" | "iframe"
  /** The dynamically imported React component */
  component?: React.ComponentType
  /** The CLI command used to install this component */
  installCommand?: string
  /** Function returning the raw source code strings */
  getFiles?: () => Promise<Record<string, CodeFile | string>>
  /** URL to the isolated, standalone preview page */
  previewUrl?: string
  /** URL to the media asset (if type is video or image) */
  mediaUrl?: string
}

export const registry: Record<string, RegistryItem> = {
  "fluid-switch-demo": {
    name: "Demo 1",
    type: "react",
    renderMode: "direct", // Simple component, render directly
    previewUrl: "/preview/fluid-switch-demo",
    component: dynamic(() =>
      import("@/registry/demos/fluid-switch-demo").then(
        (m) => m.FluidSwitchDemo
      )
    ),
    installCommand: "https://satis-ui.com/r/fluid-switch.json",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-switch")
      return {
        "fluid-switch-demo.tsx": {
          code: mod.fluidSwitchDemoString,
          language: "tsx",
        },
      }
    },
  },

  "fluid-switch-labeled": {
    name: "Demo 2",
    type: "react",
    renderMode: "iframe", // ✨ Complex/Responsive layout, forces iframe embedding
    previewUrl: "/preview/fluid-switch-labeled",
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
  // Keep your existing media items unchanged...
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

  "velocity-strips-image": {
    name: "Velocity Strips Image",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/velocity-strips-image",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-strips/velocity-strips-image").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-strips",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-strips")
      return {
        "velocity-strips-image.tsx": {
          code: mod.velocityStripsImageDemoString,
          language: "tsx",
        },
      }
    },
  },
  "velocity-strips-video": {
    name: "Velocity Strips Video",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/velocity-strips-video",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-strips/velocity-strips-video").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-strips",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-strips")
      return {
        "velocity-strips-video.tsx": {
          code: mod.velocityStripsVideoDemoString,
          language: "tsx",
        },
      }
    },
  },
  "velocity-grid-image": {
    name: "Velocity Grid Image",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/velocity-grid-image",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-grid/velocity-grid-image").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-grid",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-grid")
      return {
        "velocity-grid-image.tsx": {
          code: mod.velocityGridImageDemoString,
          language: "tsx",
        },
      }
    },
  },
  "velocity-grid-video": {
    name: "Velocity Grid Video",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/velocity-grid-video",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-grid/velocity-grid-video").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-grid",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-grid")
      return {
        "velocity-grid-video.tsx": {
          code: mod.velocityGridVideoDemoString,
          language: "tsx",
        },
      }
    },
  },
  "proximity-grid-image": {
    name: "Proximity Grid Image",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/proximity-grid-image",
    component: dynamic(() =>
      import("@/registry/demos/components/proximity-grid/proximity-grid-image").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add proximity-grid",
    getFiles: async () => {
      const mod = await import("@/registry/strings/proximity-grid")
      return {
        "proximity-grid-image.tsx": {
          code: mod.proximityGridImageDemoString,
          language: "tsx",
        },
      }
    },
  },
  "proximity-grid-video": {
    name: "Proximity Grid Video",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/proximity-grid-video",
    component: dynamic(() =>
      import("@/registry/demos/components/proximity-grid/proximity-grid-video").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add proximity-grid",
    getFiles: async () => {
      const mod = await import("@/registry/strings/proximity-grid")
      return {
        "proximity-grid-video.tsx": {
          code: mod.proximityGridVideoDemoString,
          language: "tsx",
        },
      }
    },
  },
  "liquid-marble-image": {
    name: "Liquid Marble Image",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/liquid-marble-image",
    component: dynamic(() =>
      import("@/registry/demos/components/liquid-marble/liquid-marble-image").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add liquid-marble",
    getFiles: async () => {
      const mod = await import("@/registry/strings/liquid-marble")
      return {
        "liquid-marble-image.tsx": {
          code: mod.liquidMarbleImageDemoString,
          language: "tsx",
        },
      }
    },
  },
  "liquid-marble-video": {
    name: "Liquid Marble Video",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/liquid-marble-video",
    component: dynamic(() =>
      import("@/registry/demos/components/liquid-marble/liquid-marble-video").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add liquid-marble",
    getFiles: async () => {
      const mod = await import("@/registry/strings/liquid-marble")
      return {
        "liquid-marble-video.tsx": {
          code: mod.liquidMarbleVideoDemoString,
          language: "tsx",
        },
      }
    },
  },
  "glass-slices-image": {
    name: "Glass Slices Image",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/glass-slices-image",
    component: dynamic(() =>
      import("@/registry/demos/components/glass-slices/glass-slices-image").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add glass-slices",
    getFiles: async () => {
      const mod = await import("@/registry/strings/glass-slices")
      return {
        "glass-slices-image.tsx": {
          code: mod.glassSlicesImageDemoString,
          language: "tsx",
        },
      }
    },
  },
  "glass-slices-video": {
    name: "Glass Slices Video",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/glass-slices-video",
    component: dynamic(() =>
      import("@/registry/demos/components/glass-slices/glass-slices-video").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add glass-slices",
    getFiles: async () => {
      const mod = await import("@/registry/strings/glass-slices")
      return {
        "glass-slices-video.tsx": {
          code: mod.glassSlicesVideoDemoString,
          language: "tsx",
        },
      }
    },
  },
}
