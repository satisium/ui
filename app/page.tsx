import { BentoSection } from "@/components/home/bento-previews";
import { FooterSection } from "@/components/home/footer-section"
import { HeroSection } from "@/components/home/hero-section"
import { IntroSection } from "@/components/home/intro-section"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function LandingPage() {
  return (
    // The page simply acts as the host. The hero section manages its own full-screen dimensions.
    <main className="min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
      <HeroSection />
      <IntroSection />  
      {/* <BentoSection /> */}

      {/* Subsequent sections will go here. 
          If you want the bezel effect to continue down the page, 
          you can wrap future sections in similar bg-muted padding wrappers. */}
      <FooterSection />
    </main>
  );
}
