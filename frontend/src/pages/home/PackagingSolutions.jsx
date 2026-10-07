import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHead } from "../../components/Reveal";
import { families } from "../../lib/catalog";

export const PackagingSolutions = () => {
  const [active, setActive] = useState(0);
  return (
    <section className="wrap py-20 sm:py-28" data-testid="packaging-solutions-section">
      <SectionHead eyebrow="Packaging solutions" title={["Six families that", "hold it all together"]} />
      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="relative hidden lg:col-span-5 lg:block">
          <div className="sticky top-32 rounded-[32px] p-3 neu">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
              <AnimatePresence initial={false}>
                <motion.img
                  key={active}
                  src={families[active].image}
                  alt={families[active].name}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 font-display text-sm font-extrabold uppercase">{families[active].name}</span>
            </div>
          </div>
        </div>
        <ul className="lg:col-span-7">
          {families.map((f, i) => (
            <li key={f.name} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className="border-b border-[#CDD3DB]">
              <Link to={`/products/${f.slug}`} className="group flex items-start gap-5 py-7 sm:gap-8" data-testid={`family-row-${i + 1}`}>
                <span className={`mt-1 font-mono text-sm transition-colors ${active === i ? "text-brand" : "text-brand-grey"}`}>0{i + 1}</span>
                <div className="flex-1">
                  <h3 className={`text-2xl font-black uppercase leading-none transition-colors sm:text-4xl ${active === i ? "text-brand" : "text-brand-ink"}`}>{f.name}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-grey">{f.text}</p>
                  <img src={f.image} alt={f.name} loading="lazy" className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover lg:hidden" />
                </div>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${active === i ? "rotate-45 bg-brand text-white shadow-neu-red" : "neu"}`}>
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
