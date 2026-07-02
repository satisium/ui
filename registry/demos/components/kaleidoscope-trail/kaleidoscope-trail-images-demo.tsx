import KaleidoscopeTrail from "@/registry/ui/kaleidoscope-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/14.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/17.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/18.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/19.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/20.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/21.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/22.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/23.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/24.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/25.jpg",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1781471531/ui-v3/demos/images/26.jpg",
]

export default function KaleidoscopeTrailImagesDemo() {
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
        itemClassName="border-[4px] border-white/95 shadow-2xl"
      />
    </main>
  )
}
