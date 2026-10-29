import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Boxes, CheckCircle2, Gauge, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { ProductBadges } from "../components/Badges";
import { useEnquiry } from "../components/EnquiryContext";
import { MaskLines, Reveal } from "../components/Reveal";
import { EnquiryBand } from "../components/Sections";
import { ProductCard } from "../components/ProductCard";
import { getCategory, getProduct, products } from "../lib/catalog";
import NotFound from "./NotFound";

const ICONS = [ShieldCheck, Layers, Gauge, Sparkles, Boxes, CheckCircle2];

const Block = ({ eyebrow, title, children, testid }) => (
  <section className="wrap grid gap-8 border-t border-[#CDD3DB] py-14 lg:grid-cols-12" data-testid={testid}>
    <div className="lg:col-span-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-extrabold uppercase sm:text-3xl">{title}</h2>
    </div>
    <div className="lg:col-span-8">{children}</div>
  </section>
);

export default function ProductDetail() {
  const { slug } = useParams();
  const p = getProduct(slug);
  const { openEnquiry } = useEnquiry();
  const jsonLd = useMemo(() => p && ({ "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.shortDescription, category: getCategory(p.category)?.name, brand: { "@type": "Brand", name: "Twisty Wrap Enterprises" } }), [p]);
  useSeo(p?.name, p?.shortDescription, jsonLd);
  if (!p) return <NotFound />;
  const cat = getCategory(p.category);
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  const options = Object.entries(p.options || {});
  const cta = p.cta || "Enquire now";

  return (
    <>
      <section className="pt-28 sm:pt-36" data-testid="product-hero">
        <div className="wrap">
          <Link to={`/products?category=${p.category}`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-brand-grey hover:text-brand" data-testid="product-back-link">
            <ArrowLeft className="h-4 w-4" /> {cat?.name}
          </Link>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative lg:col-span-6">
              <div className="spotlight absolute -inset-4 sm:-inset-10 -z-0" aria-hidden />
              <div className="relative rounded-[36px] p-3 neu">
                <div className="relative overflow-hidden rounded-[30px] [clip-path:polygon(0_0,100%_0,100%_86%,86%_100%,0_100%)]">
                  <img src={p.image} alt={p.name} className="aspect-[5/4] w-full object-cover" data-testid="product-hero-image" />
                </div>
                <span className="absolute bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand font-display text-sm font-black text-white shadow-neu-red">TW</span>
              </div>
            </motion.div>
            <div className="lg:col-span-6">
              <p className="eyebrow">{cat?.name} · {p.family}</p>
              <h1 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl" data-testid="product-name">
                <MaskLines animateOnMount lines={[p.name]} />
              </h1>
              <ProductBadges product={p} className="mt-6" />
              <Reveal><p className="mt-6 max-w-xl text-base leading-relaxed text-brand-grey">{p.shortDescription}</p></Reveal>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn-red" onClick={() => openEnquiry(p.name)} data-testid="product-enquire-button">{cta} <ArrowUpRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-20">
        <Block eyebrow="01 — Overview" title="Product overview" testid="product-overview">
          <p className="font-display text-xl font-semibold leading-snug sm:text-2xl">{p.fullDescription}</p>
        </Block>
        <Block eyebrow="02 — Features" title="Key features" testid="product-features">
          <div className="grid gap-4 sm:grid-cols-2">
            {p.features.map((f, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Reveal key={f} delay={i * 0.05}>
                  <div className="flex h-full items-center gap-4 rounded-[22px] p-5 neu">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white"><Icon className="h-5 w-5" /></span>
                    <span className="font-display text-base font-bold uppercase leading-tight">{f}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Block>
        <Block eyebrow="03 — Applications" title="Applications" testid="product-applications">
          <div className="flex flex-wrap gap-3">
            {p.applications.map((a) => <span key={a} className="rounded-full px-5 py-3 font-display text-sm font-bold uppercase shadow-neu-in-sm">{a}</span>)}
          </div>
        </Block>
        <Block eyebrow="04 — Benefits" title="Business benefits" testid="product-benefits">
          <ol className="space-y-4">
            {p.benefits.map((b, i) => (
              <li key={b} className="flex gap-5 border-b border-[#CDD3DB] pb-4">
                <span className="font-display text-2xl font-black text-brand">0{i + 1}</span>
                <span className="pt-1 text-base">{b}</span>
              </li>
            ))}
          </ol>
        </Block>
        {p.variants?.length > 0 && (
          <Block eyebrow="05 — Variants" title="Available variants" testid="product-variants">
            <div className="grid gap-4 md:grid-cols-2">
              {p.variants.map((v, i) => (
                <div key={v.name} className={`rounded-[22px] p-6 ${i % 2 ? "bg-brand-grey text-white" : "neu"}`}>
                  <h3 className="text-lg font-extrabold uppercase">{v.name}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${i % 2 ? "text-zinc-100" : "text-brand-grey"}`}>{v.text}</p>
                </div>
              ))}
            </div>
          </Block>
        )}
        {options.length > 0 && (
          <Block eyebrow="06 — Options" title="Available options" testid="product-options">
            <dl className="overflow-hidden rounded-[22px] neu">
              {options.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 border-b border-black/5 px-6 py-4 last:border-0">
                  <dt className="font-mono text-xs uppercase tracking-wider text-brand-grey">{k}</dt>
                  <dd className="col-span-2 text-sm font-semibold">{v.join(" · ")}</dd>
                </div>
              ))}
            </dl>
          </Block>
        )}
      </div>

      <EnquiryBand title={`Interested in ${p.name}? Request an enquiry.`} product={p.name} />

      {related.length > 0 && (
        <section className="wrap pb-10" data-testid="related-products">
          <p className="eyebrow">Related products</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ProductCard key={r.slug} product={r} />)}
          </div>
        </section>
      )}
    </>
  );
}
