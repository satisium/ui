import { FluidDisintegration } from "@/registry/ui/fluid-disintegration"

export default function FluidDisintegrationDemo() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground antialiased">
      <FluidDisintegration
        imageUrl="https://res.cloudinary.com/ddon6aux0/image/upload/q_auto,f_auto,w_1200/v1781471531/ui-v3/demos/images/0.jpg"
        rows={10}
        columns={16} // 16:10 grid ratio matches landscape perfectly
        duration={0.8}
        staggerAmount={0.6}
        rotationRange={45}
        translationRange={25}
        // Strict requirements met: Landscape dimensions, no rounded corners, no shadows, no borders
        className="h-[27rem] w-[48rem]"
      >
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <h2 className="text-6xl font-bold tracking-tight text-muted-foreground">
            Tada!
          </h2>
        </div>
      </FluidDisintegration>
    </main>
  )
}
