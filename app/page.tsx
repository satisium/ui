import { FooterSection } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"
import { MobileRestrictionWarning } from "@/components/home/mobile-restriction-warning"

export default function LandingPage() {
  return (
    // The page simply acts as the host. The hero section manages its own full-screen dimensions.
    <main className="min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <HeroSection />
      <IntroSection />

      <FooterSection />
      <MobileRestrictionWarning />
    </main>
  )
}
