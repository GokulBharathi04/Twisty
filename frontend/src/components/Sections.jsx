import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { useEnquiry } from "./EnquiryContext";

export const PageHero = ({ eyebrow, title, text, image, children }) => (
  <section className="relative pt-32 sm:pt-40">
    <div className="wrap grid items-end gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <Reveal><p className="eyebrow flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />{eyebrow}</p></Reveal>
        <h1 className="mt-6 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl">{title}</h1>
        {text && <Reveal delay={0.25}><p className="mt-6 max-w-xl text-base leading-relaxed text-brand-grey">{text}</p></Reveal>}
        {children}
      </div>
      {image && (
        <Reveal delay={0.2} className="lg:col-span-5">
          <div className="rounded-[30px] p-3 neu">
            <img src={image} alt="" className="aspect-[4/3] w-full rounded-[24px] object-cover" />
          </div>
        </Reveal>
      )}
    </div>
  </section>
);

export const EnquiryBand = ({ title = "Interested in our products? Request an enquiry.", product = "" }) => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="wrap py-20 sm:py-28">
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[34px] bg-brand px-7 py-14 text-white shadow-neu-red sm:px-14 sm:py-20">
          <div aria-hidden className="absolute -right-16 -top-16 h-72 w-72 rounded-[48px] border-[18px] border-white/10" />
          <div aria-hidden className="absolute -bottom-24 right-40 h-56 w-56 rotate-12 rounded-[40px] bg-white/[0.06]" />
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/80">Consultative supply</p>
          <h2 className="relative mt-5 max-w-3xl text-3xl font-black uppercase leading-[0.95] sm:text-5xl lg:text-6xl">{title}</h2>
          <p className="relative mt-5 max-w-xl text-sm text-white/85 sm:text-base">Tell us what you ship. We will help you identify the right film, honeycomb, cartons and quantities.</p>
          <div className="relative mt-9 flex flex-wrap gap-3">
            <button className="btn bg-white text-brand-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] hover:-translate-y-0.5" onClick={() => openEnquiry(product)} data-testid="enquiry-band-button">
              Request an enquiry <ArrowUpRight className="h-4 w-4" />
            </button>
            <Link to="/products" className="btn border border-white/40 text-white hover:bg-white/10" data-testid="enquiry-band-products-link">Browse products</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
