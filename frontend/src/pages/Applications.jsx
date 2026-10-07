import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal } from "../components/Reveal";
import { EnquiryBand, PageHero } from "../components/Sections";
import { useEnquiry } from "../components/EnquiryContext";
import { getProduct, industries } from "../lib/catalog";
import { iconFor } from "../lib/icons";

export default function Applications() {
  useSeo("Industries & Applications", "Packaging, printing and safety supplies for warehousing, logistics, e-commerce, manufacturing, retail, export, transportation and more.");
  const { hash } = useLocation();
  const { openEnquiry } = useEnquiry();
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <PageHero
        eyebrow="Industries / applications"
        title={<MaskLines animateOnMount lines={["Built for the way", <>your <span className="text-brand">business</span> moves</>]} />}
        text="From racked storage to export consignments and retail floors — see which Twisty Wrap products are typically used in each sector."
      />
      <section className="wrap space-y-6 py-20">
        {industries.map((ind, i) => {
          const Icon = iconFor(ind.icon);
          const rel = ind.products.map(getProduct).filter(Boolean);
          return (
            <Reveal key={ind.id}>
              <article id={ind.id} className="grid scroll-mt-28 gap-6 rounded-[30px] p-4 neu sm:p-6 lg:grid-cols-12 lg:items-center" data-testid={`application-${ind.id}`}>
                <div className="relative overflow-hidden rounded-[24px] lg:col-span-4">
                  <img src={ind.image} alt={ind.name} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                  <span className="absolute left-4 top-4 font-display text-4xl font-black text-white drop-shadow">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="lg:col-span-5 lg:px-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white"><Icon className="h-5 w-5" /></span>
                  <h2 className="mt-4 text-3xl font-black uppercase">{ind.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-grey sm:text-base">{ind.text}</p>
                  <button className="btn-red mt-6 px-5 py-3 text-xs" onClick={() => openEnquiry(`${ind.name} packaging requirement`)} data-testid={`application-enquire-${ind.id}`}>Enquire for {ind.name}</button>
                </div>
                <ul className="space-y-2 lg:col-span-3">
                  <li className="eyebrow mb-3 text-[10px]">Relevant products</li>
                  {rel.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/products/${p.slug}`} className="group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold shadow-neu-in-sm transition-colors hover:text-brand" data-testid={`application-${ind.id}-product-${p.slug}`}>
                        {p.name} <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:rotate-45" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          );
        })}
      </section>
      <EnquiryBand />
    </>
  );
}
