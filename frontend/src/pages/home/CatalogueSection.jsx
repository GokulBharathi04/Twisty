import { Link } from "react-router-dom";
import { Download, Maximize2 } from "lucide-react";
import { Reveal, SectionHead } from "../../components/Reveal";
import { FlipBook } from "../../components/FlipBook";
import { CATALOGUE_PDF } from "../../lib/catalog";

export const CatalogueSection = () => (
  <section className="relative overflow-hidden py-20 sm:py-28" data-testid="catalogue-section">
    <div className="wrap">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHead eyebrow="Digital catalogue" title={["Flip through", "the full catalogue"]} text="Every range, flat-laid in our red and grey catalogue format. Turn the pages here or download the PDF to share with your team." />
        <Reveal className="flex flex-wrap gap-3">
          <a href={CATALOGUE_PDF} download className="btn-red" data-testid="download-catalogue-btn"><Download className="h-4 w-4" /> Download PDF</a>
          <Link to="/catalogue" className="btn-neu" data-testid="open-catalogue-page-btn"><Maximize2 className="h-4 w-4" /> Open viewer</Link>
        </Reveal>
      </div>
      <Reveal delay={0.1} className="mt-14 rounded-[36px] p-4 neu-in sm:p-10">
        <FlipBook />
      </Reveal>
    </div>
  </section>
);
