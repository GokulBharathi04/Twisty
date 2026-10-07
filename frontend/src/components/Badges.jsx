import { Leaf, Recycle, Wrench } from "lucide-react";

const MAP = {
  biodegradable: { label: "Bio-degradable", Icon: Leaf, cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  recyclable: { label: "Recyclable", Icon: Recycle, cls: "bg-sky-50 text-sky-800 ring-sky-200" },
  customizable: { label: "Customizable", Icon: Wrench, cls: "bg-amber-50 text-amber-800 ring-amber-200" },
};

export const Badge = ({ type }) => {
  const b = MAP[type];
  if (!b) return null;
  return (
    <span className={`chip ring-1 ${b.cls}`} data-testid={`badge-${type}`}>
      <b.Icon className="h-3 w-3" /> {b.label}
    </span>
  );
};

export const ProductBadges = ({ product, className = "" }) => (
  <div className={`flex flex-wrap gap-1.5 ${className}`}>
    {product.sustainability && <Badge type={product.sustainability} />}
    {product.customizable && <Badge type="customizable" />}
  </div>
);
