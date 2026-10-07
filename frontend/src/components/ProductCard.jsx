import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { ProductBadges } from "./Badges";
import { useEnquiry } from "./EnquiryContext";
import { getCategory } from "../lib/catalog";

export const ProductCard = ({ product, compare, onCompare }) => {
  const { openEnquiry } = useEnquiry();
  const inCompare = compare?.includes(product.slug);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="group flex flex-col rounded-[26px] p-3 neu"
      data-testid={`product-card-${product.slug}`}
    >
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-[20px]" data-testid={`product-card-image-${product.slug}`}>
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-brand-ink backdrop-blur">
          {getCategory(product.category)?.name}
        </span>
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <p className="eyebrow text-[10px]">{product.family}</p>
        <h3 className="mt-1.5 text-xl font-extrabold uppercase leading-tight">
          <Link to={`/products/${product.slug}`} className="transition-colors hover:text-brand">{product.name}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-brand-grey">{product.shortDescription}</p>
        <ProductBadges product={product} className="mt-4" />
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Link to={`/products/${product.slug}`} className="btn-neu px-4 py-2.5 text-[11px]" data-testid={`view-product-${product.slug}`}>
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button className="btn-red px-4 py-2.5 text-[11px]" onClick={() => openEnquiry(product.name)} data-testid={`enquire-product-${product.slug}`}>
            Enquire
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(product.slug)}
              className={`ml-auto flex h-9 w-9 items-center justify-center rounded-full transition-shadow ${inCompare ? "bg-brand text-white shadow-neu-red" : "shadow-neu-sm"}`}
              aria-label="Add to compare"
              data-testid={`compare-toggle-${product.slug}`}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
