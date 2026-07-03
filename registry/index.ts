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
  "halftone-hero-demo": {
    name: "Halftone Hero Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/halftone-hero-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/halftone-hero/halftone-hero-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add halftone-hero",
    getFiles: async () => {
      const mod = await import("@/registry/strings/halftone-hero")
      return {
        "halftone-hero-demo.tsx": {
          code: mod.halftoneHeroDemoString,
          language: "tsx",
        },
      }
    },
  },
  "halftone-horizontal-demo": {
    name: "Halftone Horizontal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/halftone-horizontal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/halftone-horizontal/halftone-horizontal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add halftone-horizontal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/halftone-horizontal")
      return {
        "halftone-horizontal-demo.tsx": {
          code: mod.halftoneHorizontalDemoString,
          language: "tsx",
        },
      }
    },
  },
  "halftone-video-hero-demo": {
    name: "Halftone Video Hero Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/halftone-video-hero-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/halftone-video-hero/halftone-video-hero-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add halftone-video-hero",
    getFiles: async () => {
      const mod = await import("@/registry/strings/halftone-video-hero")
      return {
        "halftone-video-hero-demo.tsx": {
          code: mod.halftoneVideoHeroDemoString,
          language: "tsx",
        },
      }
    },
  },
  "halftone-video-horizontal-demo": {
    name: "Halftone Video Horizontal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/halftone-video-horizontal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/halftone-video-horizontal/halftone-video-horizontal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add halftone-video-horizontal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/halftone-video-horizontal")
      return {
        "halftone-video-horizontal-demo.tsx": {
          code: mod.halftoneVideoHorizontalDemoString,
          language: "tsx",
        },
      }
    },
  },
  "bouquet-trail-demo": {
    name: "Bouquet Trail Demo",
    type: "react",
    renderMode: "iframe", // Use iframe to prevent it leaking out over documentation UI since it tracks window mouse
    previewUrl: "/preview/bouquet-trail-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/bouquet-trail/bouquet-trail-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add bouquet-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/bouquet-trail")
      return {
        "bouquet-trail-demo.tsx": {
          code: mod.bouquetTrailDemoString,
          language: "tsx",
        },
      }
    },
  },
  "depth-trail-avatars-demo": {
    name: "Depth Trail Avatars Demo",
    type: "react",
    renderMode: "iframe", // Iframe isolates the window-bound pointermove tracking
    previewUrl: "/preview/depth-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/depth-trail/depth-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add depth-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/depth-trail")
      return {
        "depth-trail-avatars-demo.tsx": {
          code: mod.depthTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "depth-trail-images-demo": {
    name: "Depth Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/depth-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/depth-trail/depth-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add depth-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/depth-trail")
      return {
        "depth-trail-images-demo.tsx": {
          code: mod.depthTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "scatter-trail-avatars-demo": {
    name: "Scatter Trail Avatars Demo",
    type: "react",
    renderMode: "iframe", // Iframe isolates the window-bound pointermove tracking
    previewUrl: "/preview/scatter-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/scatter-trail/scatter-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add scatter-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/scatter-trail")
      return {
        "scatter-trail-avatars-demo.tsx": {
          code: mod.scatterTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "scatter-trail-images-demo": {
    name: "Scatter Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/scatter-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/scatter-trail/scatter-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add scatter-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/scatter-trail")
      return {
        "scatter-trail-images-demo.tsx": {
          code: mod.scatterTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "wind-trail-avatars-demo": {
    name: "Wind Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/wind-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/wind-trail/wind-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add wind-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/wind-trail")
      return {
        "wind-trail-avatars-demo.tsx": {
          code: mod.windTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "wind-trail-images-demo": {
    name: "Wind Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/wind-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/wind-trail/wind-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add wind-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/wind-trail")
      return {
        "wind-trail-images-demo.tsx": {
          code: mod.windTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "kaleidoscope-trail-avatars-demo": {
    name: "Kaleidoscope Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/kaleidoscope-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/kaleidoscope-trail/kaleidoscope-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add kaleidoscope-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/kaleidoscope-trail")
      return {
        "kaleidoscope-trail-avatars-demo.tsx": {
          code: mod.kaleidoscopeTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "kaleidoscope-trail-images-demo": {
    name: "Kaleidoscope Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/kaleidoscope-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/kaleidoscope-trail/kaleidoscope-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add kaleidoscope-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/kaleidoscope-trail")
      return {
        "kaleidoscope-trail-images-demo.tsx": {
          code: mod.kaleidoscopeTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "squircle-trail-avatars-demo": {
    name: "Squircle Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/squircle-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/squircle-trail/squircle-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add squircle-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/squircle-trail")
      return {
        "squircle-trail-avatars-demo.tsx": {
          code: mod.squircleTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "squircle-trail-images-demo": {
    name: "Squircle Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/squircle-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/squircle-trail/squircle-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add squircle-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/squircle-trail")
      return {
        "squircle-trail-images-demo.tsx": {
          code: mod.squircleTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "pendulum-trail-avatars-demo": {
    name: "Pendulum Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/pendulum-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/pendulum-trail/pendulum-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add pendulum-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/pendulum-trail")
      return {
        "pendulum-trail-avatars-demo.tsx": {
          code: mod.pendulumTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "pendulum-trail-images-demo": {
    name: "Pendulum Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/pendulum-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/pendulum-trail/pendulum-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add pendulum-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/pendulum-trail")
      return {
        "pendulum-trail-images-demo.tsx": {
          code: mod.pendulumTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "slinky-trail-avatars-demo": {
    name: "Slinky Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/slinky-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/slinky-trail/slinky-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add slinky-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/slinky-trail")
      return {
        "slinky-trail-avatars-demo.tsx": {
          code: mod.slinkyTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "slinky-trail-images-demo": {
    name: "Slinky Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/slinky-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/slinky-trail/slinky-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add slinky-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/slinky-trail")
      return {
        "slinky-trail-images-demo.tsx": {
          code: mod.slinkyTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
}
