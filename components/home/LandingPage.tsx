import { Features } from "./Features";
import { Footer } from "./Footer";
import { BentoFeaturesSection } from "./BentoFeaturesSection";
import { DigitalNotecardsSection } from "./DigitalNotecardsSection";
import { FeaturesGridSection } from "./FeaturesGridSection";
import { Hero } from "./Hero";
import { Pricing } from "./Pricing";

export function LandingPage() {
  return (
    <div className="min-h-full overflow-y-auto overflow-x-hidden bg-white text-[#0a0a0a]">
      <main>
        <Hero />
        <BentoFeaturesSection />
        <DigitalNotecardsSection />
        {/* <Features /> */}
        <FeaturesGridSection />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
