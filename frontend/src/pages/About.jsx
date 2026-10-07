import { Link } from "react-router-dom";
import { ArrowUpRight, Handshake, Layers, Leaf, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal, SectionHead } from "../components/Reveal";
import { EnquiryBand, PageHero } from "../components/Sections";
import { Marquee } from "../components/Marquee";
import { categories, productsIn } from "../lib/catalog";

const BLOCKS = [
  { Icon: PackageCheck, t: "Packaging expertise", d: "Stretch film, recyclable honeycomb, 3- and 5-ply cartons, tapes, foams and bubble wrap — matched to the product, the load and the route." },
  { Icon: Layers, t: "Industrial supply capability", d: "Printing, labels, banners, sun boards, display boards, thermal rolls and packing-line consumables alongside your packaging." },
  { Icon: ShieldCheck, t: "Workplace safety", d: "Helmets, gloves, reflective jackets, masks, glasses and safety shoes for shop-floor, warehouse and loading-bay teams." },
  { Icon: Leaf, t: "Sustainability direction", d: "Increasingly sustainable choices: bio-degradable film, recyclable paper honeycomb, right-sized cartons and eco-material printing." },
  { Icon: Handshake, t: "Customer-focused service", d: "A consultative approach that starts with what you ship and helps you specify the right materials and quantities." },
  { Icon: Truck, t: "Built for logistics", d: "Materials designed to protect goods through storage, handling and transport — from the warehouse floor to the customer’s door." },
];

export default function About() {
  useSeo("About Us", "About Twisty Wrap Enterprises — packaging, printing, industrial and safety supplies built to protect your goods, secure, dependable and increasingly sustainable.");
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={<MaskLines animateOnMount lines={["Packaging that", <>keeps its <span className="text-brand">promise</span></>]} />}
        text="Twisty Wrap Enterprises supplies packaging solutions built to protect your goods from the warehouse floor to the customer’s door — secure, dependable and increasingly sustainable."
        image="/img/racks.jpg"
      />
      <div className="mt-16"><Marquee items={["Secure", "Dependable", "Sustainable"]} /></div>
      <section className="wrap py-20 sm:py-28">
        <SectionHead eyebrow="What we provide" title={["The materials behind", "every safe delivery"]} />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOCKS.map((b, i) => (
            <Reveal key={b.t} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-[26px] p-7 neu" data-testid={`about-block-${i + 1}`}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white"><b.Icon className="h-6 w-6" /></span>
                <h3 className="mt-6 text-xl font-extrabold uppercase">{b.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-grey">{b.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-[#1E2026] py-20 text-white sm:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-2">
          <SectionHead light eyebrow="Our ranges" title={["Five ranges,", "one point of contact"]} text="Every range is organised so specifying the right item is easy — and you can add new products to your supply as your operation grows." />
          <ul className="divide-y divide-white/10">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/products?category=${c.id}`} className="group flex items-center justify-between py-5" data-testid={`about-range-${c.id}`}>
                  <span className="font-display text-2xl font-extrabold uppercase transition-colors group-hover:text-brand sm:text-3xl">{c.name}</span>
                  <span className="flex items-center gap-4 font-mono text-xs text-zinc-400">{productsIn(c.id).length} items <ArrowUpRight className="h-5 w-5 transition-transform group-hover:rotate-45" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
