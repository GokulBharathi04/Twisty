import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { getCategory, getProduct } from "../../lib/catalog";

const Row = ({ label, items, render }) => (
  <tr className="border-b border-black/5 align-top">
    <th className="py-3 pr-4 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-brand-grey">{label}</th>
    {items.map((p) => <td key={p.slug} className="min-w-[180px] py-3 pr-4 text-sm">{render(p)}</td>)}
  </tr>
);

const yes = (v) => (v ? <Check className="h-4 w-4 text-emerald-700" /> : <Minus className="h-4 w-4 text-brand-grey" />);

export const CompareBar = ({ slugs, onRemove, onClear }) => {
  const [open, setOpen] = useState(false);
  const items = slugs.map(getProduct).filter(Boolean);
  return (
    <>
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-[22px] bg-brand-base/95 p-3 shadow-neu-lg backdrop-blur-xl sm:p-4" data-testid="compare-bar">
            <span className="eyebrow">Compare {items.length}/3</span>
            {items.map((p) => (
              <span key={p.slug} className="chip shadow-neu-in-sm normal-case">
                {p.name}
                <button onClick={() => onRemove(p.slug)} aria-label={`Remove ${p.name}`} data-testid={`compare-remove-${p.slug}`}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <div className="ml-auto flex gap-2">
              <button className="btn-neu px-4 py-2.5 text-[11px]" onClick={onClear} data-testid="compare-clear">Clear</button>
              <button className="btn-red px-4 py-2.5 text-[11px]" disabled={items.length < 2} onClick={() => setOpen(true)} data-testid="compare-open">Compare</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-lenis-prevent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-auto rounded-[28px] border-0 bg-brand-base p-6 shadow-neu-lg sm:p-8" data-testid="compare-dialog">
          <DialogTitle className="font-display text-2xl font-extrabold uppercase">Compare products</DialogTitle>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr><th />{items.map((p) => <th key={p.slug} className="pb-4 pr-4 text-left font-display text-base font-extrabold uppercase">{p.name}</th>)}</tr>
              </thead>
              <tbody>
                <Row label="Category" items={items} render={(p) => getCategory(p.category)?.name} />
                <Row label="Family" items={items} render={(p) => p.family} />
                <Row label="Bio-degradable" items={items} render={(p) => yes(p.sustainability === "biodegradable")} />
                <Row label="Recyclable" items={items} render={(p) => yes(p.sustainability === "recyclable")} />
                <Row label="Customizable" items={items} render={(p) => yes(p.customizable)} />
                <Row label="Key features" items={items} render={(p) => <ul className="list-disc pl-4">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>} />
                <Row label="Options" items={items} render={(p) => Object.entries(p.options || {}).map(([k, v]) => <div key={k}><b>{k}:</b> {v.join(", ")}</div>)} />
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
