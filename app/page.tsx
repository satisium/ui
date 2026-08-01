import { FooterSection } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"

export default function LandingPage() {
  return (
    // The page simply acts as the host. The hero section manages its own full-screen dimensions.
    <main className="min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <HeroSection />

      {/* Subsequent sections will go here. 
          If you want the bezel effect to continue down the page, 
          you can wrap future sections in similar bg-muted padding wrappers. */}
      <FooterSection />
    </main>
  )
}
