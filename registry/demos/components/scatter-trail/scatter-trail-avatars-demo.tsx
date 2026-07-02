import ScatterTrail from "@/registry/ui/scatter-trail"

const trailImages = [
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/16.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/17.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/18.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/19.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/20.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/21.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/22.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/23.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/24.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/25.png",
  "https://res.cloudinary.com/ddon6aux0/image/upload/w_250,f_auto,q_auto/v1780746659/ui-v3/avatars/color/26.png",
]

export default function ScatterTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Scatter Cards.
        </h1>
      </div>

      <ScatterTrail
        imageUrls={trailImages}
        distance={40}
        itemSize={100}
        maxItems={20}
        duration={1500}
        slideMultiplier={120}
        maxSlide={400}
        scatterSpread={0.7}
      />
    </main>
  )
}
