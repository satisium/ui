import PendulumTrail from "@/registry/ui/pendulum-trail"

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

export default function PendulumTrailAvatarsDemo() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none flex flex-col items-center gap-8 select-none">
        <h1 className="text-[10vw] font-bold tracking-tighter text-muted md:text-[8vw]">
          Pendulum.
        </h1>
      </div>

      <PendulumTrail
        imageUrls={trailImages}
        distance={70}
        duration={3000}
        maxItems={15}
        itemSize={110}
        windAngle={10}
        windSway={5}
        physicsLength={40} // Impacts swing frequency natively
      />
    </main>
  )
}
