import { useSeo } from "../hooks/useSeo";
import { Marquee } from "../components/Marquee";
import { EnquiryBand } from "../components/Sections";
import { HeroSection } from "./home/HeroSection";
import { IntroSection } from "./home/IntroSection";
import { CategoryBento } from "./home/CategoryBento";
import { FeaturedProducts } from "./home/FeaturedProducts";
import { WhySection } from "./home/WhySection";
import { PackagingSolutions } from "./home/PackagingSolutions";
import { IndustriesSection, SustainableSection } from "./home/SustainableIndustries";

export default function Home() {
  useSeo(null, "Twisty Wrap Enterprises — stretch film, recyclable honeycomb, cartons, tapes, foams, printing, display and industrial safety supplies. Request an enquiry.");
  return (
    <>
      <HeroSection />
      <Marquee items={["Protect", "Package", "Perform", "Sustain"]} />
      <IntroSection />
      <CategoryBento />
      <FeaturedProducts />
      <WhySection />
      <PackagingSolutions />
      <SustainableSection />
      <IndustriesSection />
      <EnquiryBand title="Need the right packaging solution? Let’s specify it together." />
    </>
  );
}
