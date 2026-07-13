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
  "velocity-trail-avatars-demo": {
    name: "Velocity Trail Avatars Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/velocity-trail-avatars-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-trail/velocity-trail-avatars-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-trail")
      return {
        "velocity-trail-avatars-demo.tsx": {
          code: mod.velocityTrailAvatarsDemoString,
          language: "tsx",
        },
      }
    },
  },
  "velocity-trail-images-demo": {
    name: "Velocity Trail Images Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/velocity-trail-images-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/velocity-trail/velocity-trail-images-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add velocity-trail",
    getFiles: async () => {
      const mod = await import("@/registry/strings/velocity-trail")
      return {
        "velocity-trail-images-demo.tsx": {
          code: mod.velocityTrailImagesDemoString,
          language: "tsx",
        },
      }
    },
  },
  "editorial-reveal-demo": {
    name: "Editorial Reveal Demo",
    type: "react",
    // We strictly use iframe here so the ScrollTrigger isolates to the preview window
    // and doesn't rely on the main documentation page's scrollbar.
    renderMode: "iframe",
    previewUrl: "/preview/editorial-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/editorial-reveal/editorial-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add editorial-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/editorial-reveal")
      return {
        "editorial-reveal-demo.tsx": {
          code: mod.editorialRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
  "elastic-pop-headline-demo": {
    name: "Elastic Pop Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/elastic-pop-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/elastic-pop-reveal/elastic-pop-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add elastic-pop-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/elastic-pop-reveal")
      return {
        "elastic-pop-headline-demo.tsx": {
          code: mod.elasticPopHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "elastic-pop-paragraph-demo": {
    name: "Elastic Pop Paragraph Demo",
    type: "react",
    renderMode: "iframe", // Scroll-driven demo needs iframe isolation
    previewUrl: "/preview/elastic-pop-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/elastic-pop-reveal/elastic-pop-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add elastic-pop-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/elastic-pop-reveal")
      return {
        "elastic-pop-paragraph-demo.tsx": {
          code: mod.elasticPopParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "elastic-typewriter-headline-demo": {
    name: "Elastic Typewriter Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/elastic-typewriter-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/elastic-typewriter/elastic-typewriter-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add elastic-typewriter",
    getFiles: async () => {
      const mod = await import("@/registry/strings/elastic-typewriter")
      return {
        "elastic-typewriter-headline-demo.tsx": {
          code: mod.elasticTypewriterHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "elastic-typewriter-paragraph-demo": {
    name: "Elastic Typewriter Paragraph Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/elastic-typewriter-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/elastic-typewriter/elastic-typewriter-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add elastic-typewriter",
    getFiles: async () => {
      const mod = await import("@/registry/strings/elastic-typewriter")
      return {
        "elastic-typewriter-paragraph-demo.tsx": {
          code: mod.elasticTypewriterParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "flip-3d-headline-demo": {
    name: "Flip 3D Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/flip-3d-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/flip-3d-reveal/flip-3d-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add flip-3d-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/flip-3d-reveal")
      return {
        "flip-3d-headline-demo.tsx": {
          code: mod.flip3DHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "flip-3d-paragraph-demo": {
    name: "Flip 3D Paragraph Demo",
    type: "react",
    renderMode: "iframe", // Scroll-driven layout needs iframe isolation
    previewUrl: "/preview/flip-3d-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/flip-3d-reveal/flip-3d-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add flip-3d-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/flip-3d-reveal")
      return {
        "flip-3d-paragraph-demo.tsx": {
          code: mod.flip3DParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "flip-vertical-headline-demo": {
    name: "Flip Vertical Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/flip-vertical-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/flip-vertical-reveal/flip-vertical-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add flip-vertical-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/flip-vertical-reveal")
      return {
        "flip-vertical-headline-demo.tsx": {
          code: mod.flipVerticalHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "flip-vertical-paragraph-demo": {
    name: "Flip Vertical Paragraph Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/flip-vertical-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/flip-vertical-reveal/flip-vertical-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add flip-vertical-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/flip-vertical-reveal")
      return {
        "flip-vertical-paragraph-demo.tsx": {
          code: mod.flipVerticalParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "fluid-ink-headline-demo": {
    name: "Fluid Ink Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/fluid-ink-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/fluid-ink-reveal/fluid-ink-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add fluid-ink-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-ink-reveal")
      return {
        "fluid-ink-headline-demo.tsx": {
          code: mod.fluidInkHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "fluid-ink-paragraph-demo": {
    name: "Fluid Ink Paragraph Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/fluid-ink-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/fluid-ink-reveal/fluid-ink-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add fluid-ink-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-ink-reveal")
      return {
        "fluid-ink-paragraph-demo.tsx": {
          code: mod.fluidInkParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "blur-reveal-headline-demo": {
    name: "Blur Reveal Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/blur-reveal-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/blur-reveal/blur-reveal-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add blur-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/blur-reveal")
      return {
        "blur-reveal-headline-demo.tsx": {
          code: mod.blurRevealHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "blur-reveal-paragraph-demo": {
    name: "Blur Reveal Paragraph Demo",
    type: "react",
    renderMode: "iframe", // Isolated viewport scroll tracking
    previewUrl: "/preview/blur-reveal-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/blur-reveal/blur-reveal-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add blur-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/blur-reveal")
      return {
        "blur-reveal-paragraph-demo.tsx": {
          code: mod.blurRevealParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "fluid-typewriter-headline-demo": {
    name: "Fluid Typewriter Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/fluid-typewriter-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/fluid-typewriter/fluid-typewriter-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add fluid-typewriter",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-typewriter")
      return {
        "fluid-typewriter-headline-demo.tsx": {
          code: mod.fluidTypewriterHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "fluid-typewriter-paragraph-demo": {
    name: "Fluid Typewriter Paragraph Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/fluid-typewriter-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/fluid-typewriter/fluid-typewriter-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add fluid-typewriter",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fluid-typewriter")
      return {
        "fluid-typewriter-paragraph-demo.tsx": {
          code: mod.fluidTypewriterParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "granular-dust-headline-demo": {
    name: "Granular Dust Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/granular-dust-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/granular-dust-reveal/granular-dust-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add granular-dust-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/granular-dust-reveal")
      return {
        "granular-dust-headline-demo.tsx": {
          code: mod.granularDustHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "granular-dust-paragraph-demo": {
    name: "Granular Dust Paragraph Demo",
    type: "react",
    renderMode: "direct", // Direct is perfectly fine here since it's a clean 100vh layout
    previewUrl: "/preview/granular-dust-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/granular-dust-reveal/granular-dust-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add granular-dust-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/granular-dust-reveal")
      return {
        "granular-dust-paragraph-demo.tsx": {
          code: mod.granularDustParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "heat-mirage-headline-demo": {
    name: "Heat Mirage Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/heat-mirage-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/heat-mirage-reveal/heat-mirage-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add heat-mirage-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/heat-mirage-reveal")
      return {
        "heat-mirage-headline-demo.tsx": {
          code: mod.heatMirageHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "heat-mirage-paragraph-demo": {
    name: "Heat Mirage Paragraph Demo",
    type: "react",
    renderMode: "direct", // Since it uses the h-screen format, direct works perfectly
    previewUrl: "/preview/heat-mirage-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/heat-mirage-reveal/heat-mirage-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add heat-mirage-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/heat-mirage-reveal")
      return {
        "heat-mirage-paragraph-demo.tsx": {
          code: mod.heatMirageParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "liquid-mercury-headline-demo": {
    name: "Liquid Mercury Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/liquid-mercury-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/liquid-mercury-reveal/liquid-mercury-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add liquid-mercury-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/liquid-mercury-reveal")
      return {
        "liquid-mercury-headline-demo.tsx": {
          code: mod.liquidMercuryHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "magnetic-snap-demo": {
    name: "Magnetic Snap Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/magnetic-snap-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/magnetic-snap-reveal/magnetic-snap-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add magnetic-snap-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/magnetic-snap-reveal")
      return {
        "magnetic-snap-demo.tsx": {
          code: mod.magneticSnapDemoString,
          language: "tsx",
        },
      }
    },
  },
  "manifesto-text-reveal-demo": {
    name: "Manifesto Text Reveal Demo",
    type: "react",
    renderMode: "iframe", // CRITICAL: Pinning requires iframe to prevent breaking the main docs scrollbar
    previewUrl: "/preview/manifesto-text-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/manifesto-text-reveal/manifesto-text-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add manifesto-text-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/manifesto-text-reveal")
      return {
        "manifesto-text-reveal-demo.tsx": {
          code: mod.manifestoTextRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
  "masked-reveal-headline-demo": {
    name: "Masked Reveal Headline Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/masked-reveal-headline-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/masked-reveal/masked-reveal-headline-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add masked-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/masked-reveal")
      return {
        "masked-reveal-headline-demo.tsx": {
          code: mod.maskedRevealHeadlineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "masked-reveal-paragraph-demo": {
    name: "Masked Reveal Paragraph Demo",
    type: "react",
    renderMode: "iframe", // Use iframe to protect scroll layout for multiline demo
    previewUrl: "/preview/masked-reveal-paragraph-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/masked-reveal/masked-reveal-paragraph-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add masked-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/masked-reveal")
      return {
        "masked-reveal-paragraph-demo.tsx": {
          code: mod.maskedRevealParagraphDemoString,
          language: "tsx",
        },
      }
    },
  },
  "fold-reveal-demo": {
    name: "Fold Reveal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/fold-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/fold-reveal/fold-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add fold-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/fold-reveal")
      return {
        "fold-reveal-demo.tsx": {
          code: mod.foldRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
  "pendulum-reveal-demo": {
    name: "Pendulum Reveal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/pendulum-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/pendulum-reveal/pendulum-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add pendulum-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/pendulum-reveal")
      return {
        "pendulum-reveal-demo.tsx": {
          code: mod.pendulumRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
  "piano-typewriter-demo": {
    name: "Piano Typewriter Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/piano-typewriter-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/piano-typewriter/piano-typewriter-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add piano-typewriter",
    getFiles: async () => {
      const mod = await import("@/registry/strings/piano-typewriter")
      return {
        "piano-typewriter-demo.tsx": {
          code: mod.pianoTypewriterDemoString,
          language: "tsx",
        },
      }
    },
  },
  "multi-color-trail-char-demo": {
    name: "Multi-Color Trail Char Demo",
    type: "react",
    renderMode: "iframe", // Pinning requires iframe to prevent breaking main doc scrolling
    previewUrl: "/preview/multi-color-trail-char-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/multi-color-trail-reveal/multi-color-trail-char-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add multi-color-trail-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/multi-color-trail-reveal")
      return {
        "multi-color-trail-char-demo.tsx": {
          code: mod.multiColorTrailCharDemoString,
          language: "tsx",
        },
      }
    },
  },
  "multi-color-trail-word-demo": {
    name: "Multi-Color Trail Word Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/multi-color-trail-word-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/multi-color-trail-reveal/multi-color-trail-word-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add multi-color-trail-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/multi-color-trail-reveal")
      return {
        "multi-color-trail-word-demo.tsx": {
          code: mod.multiColorTrailWordDemoString,
          language: "tsx",
        },
      }
    },
  },
  "multi-color-trail-line-demo": {
    name: "Multi-Color Trail Line Demo",
    type: "react",
    renderMode: "iframe",
    previewUrl: "/preview/multi-color-trail-line-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/multi-color-trail-reveal/multi-color-trail-line-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add multi-color-trail-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/multi-color-trail-reveal")
      return {
        "multi-color-trail-line-demo.tsx": {
          code: mod.multiColorTrailLineDemoString,
          language: "tsx",
        },
      }
    },
  },
  "tumbler-roll-reveal-demo": {
    name: "Tumbler Roll Reveal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/tumbler-roll-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/tumbler-roll-reveal/tumbler-roll-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add tumbler-roll-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/tumbler-roll-reveal")
      return {
        "tumbler-roll-reveal-demo.tsx": {
          code: mod.tumblerRollRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
  "bottom-hinge-text-reveal-demo": {
    name: "Bottom Hinge Text Reveal Demo",
    type: "react",
    renderMode: "direct",
    previewUrl: "/preview/bottom-hinge-text-reveal-demo",
    component: dynamic(() =>
      import("@/registry/demos/components/bottom-hinge-text-reveal/bottom-hinge-text-reveal-demo").then(
        (m) => m.default
      )
    ),
    installCommand: "npx satis-ui add bottom-hinge-text-reveal",
    getFiles: async () => {
      const mod = await import("@/registry/strings/bottom-hinge-text-reveal")
      return {
        "bottom-hinge-text-reveal-demo.tsx": {
          code: mod.bottomHingeTextRevealDemoString,
          language: "tsx",
        },
      }
    },
  },
}
