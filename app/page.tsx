import { FooterSection } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"
import { MobileRestrictionWarning } from "@/components/home/mobile-restriction-warning"
import { SITE_URL } from "@/lib/config"

export default function LandingPage() {
  return (
    // The page simply acts as the host. The hero section manages its own full-screen dimensions.
    <main className="min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
            ],
          }),
        }}
      />
      <HeroSection />
      <IntroSection />

      <FooterSection />
      <MobileRestrictionWarning />
    </main>
  )
}
