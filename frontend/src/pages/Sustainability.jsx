import { useLayoutEffect } from "react";
import { Leaf, Printer, Recycle, Ruler } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal, SectionHead } from "../components/Reveal";
import { EnquiryBand, PageHero } from "../components/Sections";
import { ProductCard } from "../components/ProductCard";
import { getProduct } from "../lib/catalog";
import { asset } from "../lib/asset";

const PILLARS = [
  { Icon: Leaf, t: "Bio-degradable options", img: asset("/img/film-roll.jpg"), d: "Our stretch film is offered in biodegradable / oxo-biodegradable grades as well as conventional LLDPE, so you can choose the grade that suits your sustainability direction and your load. Other bio-based materials — compostable pouches and bio-based void-fill — can be developed on request." },
  { Icon: Recycle, t: "Recyclable materials", img: asset("/img/honeycomb.jpg"), d: "Recyclable honeycomb is a paper-based cellular packaging material used for cushioning, void filling and box lining. Honeycomb pallets, boxes, partitions, displays and door cores offer a lightweight alternative to wood and foam that can be recycled with paper waste where facilities exist." },
  { Icon: Ruler, t: "Right-sizing", img: asset("/img/carton-open.jpg"), d: "Cartons custom-sized to your product’s exact dimensions and inserts die-cut to its shape help reduce unnecessary material, void fill and freight volume — a practical step that also lowers damage in transit." },
  { Icon: Printer, t: "Eco-friendly printing", img: asset("/img/eco2.jpg"), d: "Printing on kraft paper, recycled board and bio-films, with soy- or water-based inks on request, and recyclable PVC-free banner substrates for factory signage and branding." },
];

// The Sustainable & Bio-Degradable Range catalogue, section by section. Items the
// site already listed elsewhere (stretch film, paper tapes, honeycomb, banners) are
// linked rather than duplicated.
const BIO_RANGE = [
  {
    id: "bio-packaging",
    title: "Bio-degradable packaging",
    text: "Kraft paper, compostable films, plant-fibre and sugarcane-based packaging components, available to client specification and quantity.",
    slugs: ["stretch-film-biodegradable", "compostable-shrink-film", "compostable-bubble-rolls", "sr-biopolymer-bio-film", "paper-tapes", "compostable-mailing-bags", "honeycomb-wrap", "plant-fibre-packaging", "sugarcane-bagasse-packaging", "molded-pulp-inserts"],
  },
  {
    id: "eco-print",
    title: "Eco print & labeling",
    text: "Printing on recycled or biodegradable substrates, with soy- or water-based inks on request across all printed materials.",
    slugs: ["eco-friendly-material-printing", "recyclable-banners", "kraft-paper-labels", "bio-film-wrapping", "recycled-board-bio-film-printing", "soy-water-based-ink-labels"],
  },
  {
    id: "eco-stationery",
    title: "Eco stationery & gifts",
    text: "Recycled-paper and plantable stationery, seed-paper gift kits and customized corporate gifts for offices, events and welcome kits.",
    slugs: ["recycled-paper-pens", "plantable-seed-pens", "recycled-plantable-pencils", "recycled-notebooks-diaries", "eco-files-folders-notepads", "seed-paper-gift-kits", "customized-corporate-gifts"],
  },
].map((g) => ({ ...g, items: g.slugs.map(getProduct).filter(Boolean) }));

export default function Sustainability() {
  // This page wears the bio catalogue's palette (html.theme-bio in index.css)
  useLayoutEffect(() => {
    document.documentElement.classList.add("theme-bio");
    return () => document.documentElement.classList.remove("theme-bio");
  }, []);
  useSeo("Sustainable Products", "Compostable films and bags, recyclable paper honeycomb, plant-fibre and bagasse packaging, eco printing and recycled-paper stationery from Twisty Wrap Enterprises.");
  return (
    <>
      <PageHero
        eyebrow="Sustainable Products"
        title={<MaskLines animateOnMount lines={["Increasingly", <span key="s" className="text-[#2A6B5C]">sustainable</span>, "by design"]} />}
        text="We help customers make responsible packaging choices with factual information — what a material is, how it performs, and how it can be disposed of or recycled."
        image={asset("/img/eco.jpg")}
      />
      <section className="wrap py-20" id="bio-range" data-testid="bio-range">
        <SectionHead eyebrow="Sustainable & bio-degradable range" title="The full eco range" />
        <nav className="mt-8 flex flex-wrap gap-3" aria-label="Range sections">
          {BIO_RANGE.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="chip shadow-neu-sm transition-shadow hover:shadow-neu-in-sm">
              {g.title} <span className="text-brand-grey">{g.items.length}</span>
            </a>
          ))}
        </nav>
        {BIO_RANGE.map((g) => (
          <div key={g.id} id={g.id} className="scroll-mt-28 pt-14" data-testid={`bio-range-${g.id}`}>
            <div className="max-w-2xl">
              <h3 className="text-2xl font-black uppercase sm:text-3xl">{g.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-grey sm:text-base">{g.text}</p>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        ))}
      </section>
      <section className="wrap space-y-8 py-20 sm:py-24">
        {PILLARS.map((p, i) => (
          <Reveal key={p.t}>
            <article className={`grid items-center gap-8 rounded-[32px] p-4 neu sm:p-6 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`} data-testid={`sustainability-pillar-${i + 1}`}>
              <img src={p.img} alt={p.t} loading="lazy" className="aspect-[16/10] w-full rounded-[26px] object-cover" />
              <div className="p-2 sm:p-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2A6B5C] text-[#F4EEDE]"><p.Icon className="h-6 w-6" /></span>
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
      <EnquiryBand title="Planning a more sustainable pack? Let’s talk materials." />
    </>
  );
}
