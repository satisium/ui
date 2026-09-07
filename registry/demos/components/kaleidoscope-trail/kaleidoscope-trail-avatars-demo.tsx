import KaleidoscopeTrail from "@/registry/ui/kaleidoscope-trail"

const trailImages = [
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/16.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/17.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/18.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/19.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/20.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/21.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/22.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/23.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/24.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/25.webp",
  "https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v2/in-demo-assets/components/images/avatars/mono/26.webp",
]

export default function KaleidoscopeTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Symmetry.
        </h1>
      </div>

      <KaleidoscopeTrail
        imageUrls={trailImages}
        distance={60}
        itemSize={110}
        maxGroups={5}
        mirrors={8} // Creates an octagon of clones
        duration={2400}
      />
    </main>
  )
}
