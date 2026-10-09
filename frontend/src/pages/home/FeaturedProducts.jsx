import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, SectionHead } from "../../components/Reveal";
import { ProductCard } from "../../components/ProductCard";
import { isFlagship, products } from "../../lib/catalog";

export const FeaturedProducts = () => {
  const featured = products.filter(isFlagship);
  return (
    <section className="py-20 sm:py-28" data-testid="featured-section">
      <div className="wrap flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHead eyebrow="Flagship products" title={["Stretch film &", "honeycomb products"]} text="Our flagship ranges: Stretch Film in Bio and Non Bio-Degradable grades, and Honeycomb based products." />
        <Reveal><Link to="/products" className="btn-neu" data-testid="featured-view-all">All products <ArrowUpRight className="h-4 w-4" /></Link></Reveal>
      </div>
      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-10 pt-4 sm:px-8 lg:px-[max(3rem,calc((100vw-1320px)/2+3rem))]">
        {featured.map((p) => (
          <div key={p.slug} className="w-[290px] shrink-0 snap-start sm:w-[330px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};
