import { motion } from "framer-motion";
import { ClipboardCheck, Leaf, ShieldCheck } from "lucide-react";
import { Reveal, SectionHead } from "../../components/Reveal";
import { asset } from "../../lib/asset";

const PILLARS = [
  { Icon: ShieldCheck, t: "Reliable protection", d: "Materials strong enough to hold loads together and protective enough to safeguard products through storage, handling and transport." },
  { Icon: Leaf, t: "Responsible choices", d: "Bio-degradable stretch film, recyclable paper honeycomb and eco-friendly printing wherever they suit your application." },
  { Icon: ClipboardCheck, t: "Easy specification", d: "Clear product families, variants and options — so finding the right film, carton or insert for what you ship is simple." },
];

export const IntroSection = () => (
  <section className="wrap py-20 sm:py-28" data-testid="intro-section">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-6">
        <SectionHead eyebrow="About Twisty Wrap Enterprises" title={["From the warehouse", "floor to the", "customer’s door"]} />
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl font-display text-xl font-semibold leading-snug text-brand-ink sm:text-2xl">
            We supply packaging, printing and industrial materials that are strong enough to hold loads together, protective enough to safeguard products, practical for storage and transportation — and increasingly sustainable.
          </p>
        </Reveal>
      </div>
      <motion.div
        className="lg:col-span-6"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <div className="rounded-[32px] p-3 neu">
          <motion.div
            variants={{ hidden: { clipPath: "inset(0 0 100% 0 round 26px)" }, show: { clipPath: "inset(0 0 0% 0 round 26px)" } }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.18, 1] }}
            className="relative overflow-hidden rounded-[26px]"
          >
            <motion.img
              variants={{ hidden: { scale: 1.25 }, show: { scale: 1 } }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              src={asset("/img/warehouse.jpg")}
              alt="Warehouse aisle stocked with palletised goods"
              className="aspect-[5/4] w-full object-cover"
            />
            <div className="absolute bottom-4 right-4 rounded-2xl bg-brand px-4 py-3 text-white">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-white/80">Positioning</span>
              <span className="font-display text-sm font-extrabold uppercase">Secure · Dependable · Sustainable</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
    <div className="mt-16 grid gap-6 md:grid-cols-3">
      {PILLARS.map((p, i) => (
        <Reveal key={p.t} delay={i * 0.1}>
          <div className="group h-full rounded-[26px] p-7 neu transition-transform duration-500 hover:-translate-y-1.5" data-testid={`pillar-${i + 1}`}>
            <div className="flex items-center justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-neu-in-sm transition-colors group-hover:bg-brand group-hover:text-white">
                <p.Icon className="h-6 w-6" />
              </span>
              <span className="font-display text-5xl font-black text-[#D3D9E1]">0{i + 1}</span>
            </div>
            <h3 className="mt-6 text-xl font-extrabold uppercase">{p.t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-grey">{p.d}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);
