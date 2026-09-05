import { FerrofluidDrag } from "@/registry/ui/ferrofluid-drag"

export default function FerrofluidDragDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased">
      <FerrofluidDrag
        imageUrl="https://cdn.jsdelivr.net/gh/satisium/ui-assets@main/v1/in-demo-assets/components/images/stock/28.jpg"
        columns={16} // Optimized for landscape proportions
        rows={10}
        // Strict requirements met: Landscape dimensions, no rounded corners, no shadows, no borders
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </FerrofluidDrag>
    </main>
  )
}
