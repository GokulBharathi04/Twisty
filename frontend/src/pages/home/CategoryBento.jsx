import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHead } from "../../components/Reveal";
import { categories, productsIn } from "../../lib/catalog";

const SPANS = ["lg:col-span-3 lg:row-span-2", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3", "lg:col-span-3"];

export const CategoryBento = () => (
  <section className="wrap py-20 sm:py-28" data-testid="categories-section">
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <SectionHead eyebrow="Product categories" title={["Five ranges.", "One dependable supplier."]} text="Browse packaging, printing and display, industrial safety, business stationery and sustainable products." />
      <Reveal><Link to="/products" className="btn-neu" data-testid="categories-view-all">View full catalogue <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
    </div>
    <div className="mt-14 grid auto-rows-[300px] gap-5 sm:auto-rows-[280px] lg:grid-cols-6">
      {categories.map((c, i) => (
        <Reveal key={c.id} delay={i * 0.06} className={SPANS[i]}>
          <Link to={`/products?category=${c.id}`} className="group block h-full rounded-[30px] p-2.5 neu" data-testid={`category-tile-${c.id}`}>
            <div className="relative h-full overflow-hidden rounded-[24px]">
              <img src={c.image} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14161A]/90 via-[#14161A]/35 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-brand-ink">
                {String(productsIn(c.id).length).padStart(2, "0")} products
              </span>
              <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <h3 className={`font-black uppercase leading-none text-white ${i === 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"}`}>{c.name}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-200">{c.short}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-white">
                  Explore category <span className="h-px w-8 bg-brand transition-[width] duration-500 group-hover:w-14" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  </section>
);
