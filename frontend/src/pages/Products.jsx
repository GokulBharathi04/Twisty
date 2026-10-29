import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { ProductCard } from "../components/ProductCard";
import { EnquiryBand } from "../components/Sections";
import { MaskLines, Reveal } from "../components/Reveal";
import { CompareBar } from "./products/CompareBar";
import { categories, productsIn, products, searchProducts } from "../lib/catalog";

const FLAGS = [
  { id: "biodegradable", label: "Bio-degradable" },
  { id: "recyclable", label: "Recyclable" },
  { id: "customizable", label: "Customizable" },
];

export default function Products() {
  useSeo("Products", "Browse the Twisty Wrap Enterprises product range: packaging, printing & display, industrial safety, stationery and sustainable products.");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const q = params.get("q") || "";
  const [flags, setFlags] = useState([]);
  const [compare, setCompare] = useState([]);

  const update = (k, v) => {
    const next = new URLSearchParams(params);
    if (v && v !== "all") next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggleFlag = (f) => setFlags((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));
  const toggleCompare = (s) => setCompare((x) => (x.includes(s) ? x.filter((y) => y !== s) : x.length >= 3 ? x : [...x, s]));

  const list = useMemo(() => {
    let l = category === "all" ? products : productsIn(category);
    l = searchProducts(q, l);
    return l.filter((p) => flags.every((f) => (f === "customizable" ? p.customizable : p.sustainability === f)));
  }, [category, q, flags]);

  return (
    <>
      <section className="pt-32 sm:pt-40">
        <div className="wrap">
          <Reveal><p className="eyebrow flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />Full product range</p></Reveal>
          <h1 className="mt-6 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            <MaskLines animateOnMount lines={["Find the right", <>material, <span className="text-brand">fast.</span></>]} />
          </h1>
          <div className="mt-10 rounded-[30px] p-4 neu sm:p-6" data-testid="catalogue-filters">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-grey" />
              <input
                value={q}
                onChange={(e) => update("q", e.target.value)}
                placeholder="Search products — try “stretch” or “honeycomb”"
                className="field rounded-full py-4 pl-14 pr-12 text-base"
                aria-label="Search products"
                data-testid="product-search-input"
              />
              {q && (
                <button onClick={() => update("q", "")} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-brand-grey hover:text-brand" aria-label="Clear search" data-testid="product-search-clear">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="no-scrollbar mt-5 flex gap-2.5 overflow-x-auto pb-1">
              {[{ id: "all", name: "All products" }, ...categories].map((c) => (
                <button
                  key={c.id}
                  onClick={() => update("category", c.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.1em] transition-[box-shadow,color,background-color] ${category === c.id ? "bg-brand text-white shadow-neu-red" : "shadow-neu-sm hover:text-brand"}`}
                  data-testid={`category-filter-${c.id}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="eyebrow mr-1 text-[10px]">Filter</span>
              {FLAGS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => toggleFlag(f.id)}
                  className={`chip transition-shadow ${flags.includes(f.id) ? "text-brand shadow-neu-in-sm" : "shadow-neu-sm"}`}
                  data-testid={`flag-filter-${f.id}`}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto font-mono text-xs text-brand-grey" data-testid="product-results-count">{list.length} results</span>
            </div>
          </div>
        </div>
      </section>
      <section className="wrap py-14">
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="product-grid">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} compare={compare} onCompare={toggleCompare} />
            ))}
          </AnimatePresence>
        </motion.div>
        {!list.length && (
          <div className="rounded-[26px] p-12 text-center neu-in" data-testid="product-empty-state">
            <p className="font-display text-2xl font-extrabold uppercase">No products match</p>
            <p className="mt-2 text-sm text-brand-grey">Try a different search, or ask us — we may supply it on request.</p>
          </div>
        )}
      </section>
      <CompareBar slugs={compare} onRemove={toggleCompare} onClear={() => setCompare([])} />
      <EnquiryBand title="Can’t find exactly what you need? Ask us." />
    </>
  );
}
