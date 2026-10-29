import { Link } from "react-router-dom";
import { iconFor } from "../../lib/icons";
import { ArrowUpRight, Leaf, Recycle, Ruler } from "lucide-react";
import { Reveal, SectionHead } from "../../components/Reveal";
import { industries } from "../../lib/catalog";
import { asset } from "../../lib/asset";

const ECO = [
  { Icon: Leaf, t: "Bio-degradable options", d: "Bio-degradable / oxo-biodegradable stretch film and eco-material printing." },
  { Icon: Recycle, t: "Recyclable materials", d: "Paper-based honeycomb pallets, boxes, partitions and wraps." },
  { Icon: Ruler, t: "Right-sizing", d: "Cartons and inserts sized to your product to cut unnecessary material and freight volume." },
];

export const SustainableSection = () => (
  <section className="wrap py-20 sm:py-28" data-testid="sustainable-section">
    <div className="grid items-center gap-10 rounded-[36px] p-5 neu sm:p-8 lg:grid-cols-2 lg:p-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px]">
          <img src={asset("/img/eco2.jpg")} alt="Kraft paper based eco-friendly packaging" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <span className="absolute left-5 top-5 rounded-full bg-emerald-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white">Increasingly sustainable</span>
        </div>
      </Reveal>
      <div className="lg:pr-6">
        <SectionHead eyebrow="Sustainable solutions" title={["Responsible choices,", "factually stated"]} text="Sustainable options depend on the product, the grade selected and local recycling or disposal facilities — we help you pick what genuinely suits your application." />
        <div className="mt-8 space-y-4">
          {ECO.map((e, i) => (
            <Reveal key={e.t} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-2xl p-4 shadow-neu-in-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white"><e.Icon className="h-5 w-5" /></span>
                <div>
                  <h3 className="font-display text-base font-extrabold uppercase">{e.t}</h3>
                  <p className="mt-1 text-sm text-brand-grey">{e.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal><Link to="/sustainability" className="btn-neu mt-8" data-testid="sustainable-learn-more">Our sustainability approach <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
      </div>
    </div>
  </section>
);

export const IndustriesSection = () => (
  <section className="wrap py-20 sm:py-28" data-testid="industries-section">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <SectionHead eyebrow="Industries / applications" title={["Where our materials", "go to work"]} />
      <Reveal><Link to="/applications" className="btn-neu" data-testid="industries-view-all">All applications <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
    </div>
    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {industries.map((ind, i) => {
        const Icon = iconFor(ind.icon);
        return (
          <Reveal key={ind.id} delay={(i % 5) * 0.05}>
            <Link to={`/applications#${ind.id}`} className="group flex h-full flex-col justify-between gap-8 rounded-[24px] p-5 neu transition-[box-shadow] duration-300 hover:shadow-neu-in sm:p-6" data-testid={`industry-tile-${ind.id}`}>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-neu-in-sm transition-colors group-hover:bg-brand group-hover:text-white"><Icon className="h-5 w-5" /></span>
              <span className="font-display text-base font-extrabold uppercase leading-tight sm:text-lg">{ind.name}</span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  </section>
);
