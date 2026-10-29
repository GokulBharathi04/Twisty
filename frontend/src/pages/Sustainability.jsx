import { Leaf, Printer, Recycle, Ruler } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal, SectionHead } from "../components/Reveal";
import { EnquiryBand, PageHero } from "../components/Sections";
import { ProductCard } from "../components/ProductCard";
import { products } from "../lib/catalog";
import { asset } from "../lib/asset";

const PILLARS = [
  { Icon: Leaf, t: "Bio-degradable options", img: asset("/img/film-roll.jpg"), d: "Our stretch film is offered in biodegradable / oxo-biodegradable grades as well as conventional LLDPE, so you can choose the grade that suits your sustainability direction and your load. Other bio-based materials — compostable pouches and bio-based void-fill — can be developed on request." },
  { Icon: Recycle, t: "Recyclable materials", img: asset("/img/honeycomb.jpg"), d: "Recyclable honeycomb is a paper-based cellular packaging material used for cushioning, void filling and box lining. Honeycomb pallets, boxes, partitions, displays and door cores offer a lightweight alternative to wood and foam that can be recycled with paper waste where facilities exist." },
  { Icon: Ruler, t: "Right-sizing", img: asset("/img/carton-open.jpg"), d: "Cartons custom-sized to your product’s exact dimensions and inserts die-cut to its shape help reduce unnecessary material, void fill and freight volume — a practical step that also lowers damage in transit." },
  { Icon: Printer, t: "Eco-friendly printing", img: asset("/img/eco2.jpg"), d: "Printing on kraft paper, recycled board and bio-films, with soy- or water-based inks on request, and recyclable PVC-free banner substrates for factory signage and branding." },
];

export default function Sustainability() {
  useSeo("Sustainability", "Bio-degradable stretch film, recyclable paper honeycomb, right-sized cartons and eco-friendly printing from Twisty Wrap Enterprises.");
  const eco = products.filter((p) => p.sustainability).slice(0, 6);
  return (
    <>
      <PageHero
        eyebrow="Sustainability"
        title={<MaskLines animateOnMount lines={["Increasingly", <span key="s" className="text-emerald-700">sustainable</span>, "by design"]} />}
        text="We help customers make responsible packaging choices with factual information — what a material is, how it performs, and how it can be disposed of or recycled."
        image={asset("/img/eco.jpg")}
      />
      <section className="wrap space-y-8 py-20 sm:py-28">
        {PILLARS.map((p, i) => (
          <Reveal key={p.t}>
            <article className={`grid items-center gap-8 rounded-[32px] p-4 neu sm:p-6 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`} data-testid={`sustainability-pillar-${i + 1}`}>
              <img src={p.img} alt={p.t} loading="lazy" className="aspect-[16/10] w-full rounded-[26px] object-cover" />
              <div className="p-2 sm:p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white"><p.Icon className="h-6 w-6" /></span>
                <h2 className="mt-6 text-3xl font-black uppercase sm:text-4xl">{p.t}</h2>
                <p className="mt-4 text-sm leading-relaxed text-brand-grey sm:text-base">{p.d}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
      <section className="wrap pb-10">
        <div className="rounded-[28px] p-8 neu-in sm:p-12" data-testid="sustainability-note">
          <p className="eyebrow">A note on claims</p>
          <p className="mt-4 max-w-3xl font-display text-xl font-semibold leading-snug sm:text-2xl">
            Sustainable performance depends on the product, the grade selected and local recycling or disposal facilities. We don’t describe any material as having zero impact — we help you choose the most suitable option for your application.
          </p>
        </div>
      </section>
      <section className="wrap py-20">
        <SectionHead eyebrow="Sustainable products" title="Start with these" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eco.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
      <EnquiryBand title="Planning a more sustainable pack? Let’s talk materials." />
    </>
  );
}
