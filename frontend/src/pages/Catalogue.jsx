import { Download } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal } from "../components/Reveal";
import { FlipBook } from "../components/FlipBook";
import { EnquiryBand } from "../components/Sections";
import { CATALOGUE_PDF, cataloguePages } from "../lib/catalog";

export default function Catalogue() {
  useSeo("Product Catalogue", "Flip through the Twisty Wrap Enterprises product catalogue online or download the PDF.");
  return (
    <>
      <section className="pt-32 sm:pt-40">
        <div className="wrap flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />{cataloguePages.length} pages · A4 · PDF</p>
            <h1 className="mt-6 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              <MaskLines animateOnMount lines={["Product", <span key="c" className="text-brand">catalogue</span>]} />
            </h1>
          </div>
          <a href={CATALOGUE_PDF} download className="btn-red self-start lg:self-auto" data-testid="catalogue-page-download-btn"><Download className="h-4 w-4" /> Download PDF</a>
        </div>
        <Reveal delay={0.15} className="wrap mt-12">
          <div className="rounded-[36px] p-4 neu-in sm:p-10"><FlipBook /></div>
        </Reveal>
      </section>
      <EnquiryBand />
    </>
  );
}
