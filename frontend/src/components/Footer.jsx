import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { useEnquiry } from "./EnquiryContext";
import { CONTACT, categories } from "../lib/catalog";

const QUICK = [["Home", "/"], ["About", "/about"], ["Products", "/products"], ["Sustainability", "/sustainability"], ["Applications", "/applications"], ["Catalogue", "/catalogue"], ["Contact", "/contact"]];

export const Footer = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <footer className="relative mt-10 overflow-hidden bg-[#1E2026] text-zinc-300" data-testid="site-footer">
      <div className="wrap py-16 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] bg-[#25282F] p-8 shadow-[inset_6px_6px_14px_#17191d,inset_-6px_-6px_14px_#30343c] sm:p-12 lg:flex-row lg:items-center">
          <h2 className="max-w-xl text-3xl font-extrabold uppercase leading-none text-white sm:text-5xl">
            Need the right <span className="text-brand">packaging</span> solution?
          </h2>
          <button className="btn-red" onClick={() => openEnquiry("")} data-testid="footer-enquiry-button">
            Request an enquiry <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-400">
              Packaging solutions built to protect your goods from the warehouse floor to the customer’s door — secure, dependable and increasingly sustainable.
            </p>
          </div>
          <div>
            <p className="eyebrow text-zinc-400">Quick links</p>
            <ul className="mt-5 space-y-2.5">
              {QUICK.map(([l, to]) => (
                <li key={to}><Link to={to} className="text-sm text-zinc-300 transition-colors hover:text-white" data-testid={`footer-link-${l.toLowerCase()}`}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-zinc-400">Product categories</p>
            <ul className="mt-5 space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}><Link to={`/products?category=${c.id}`} className="text-sm text-zinc-300 transition-colors hover:text-white" data-testid={`footer-category-${c.id}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-zinc-400">Contact</p>
            <ul className="mt-5 space-y-2.5 text-sm text-zinc-300" data-testid="footer-contact">
              {CONTACT.phones.map((p) => <li key={p}><a href={`tel:+91${p}`} className="hover:text-white" data-testid={`footer-phone-${p}`}>+91 {p}</a></li>)}
              <li><a href={`mailto:${CONTACT.email}`} className="break-all hover:text-white" data-testid="footer-email">{CONTACT.email}</a></li>
              <li className="leading-relaxed">{CONTACT.address}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex-row">
          <span>© {new Date().getFullYear()} Twisty Wrap Enterprises. All rights reserved.</span>
          <span className="font-mono uppercase tracking-widest">Protect · Package · Perform · Sustain</span>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none whitespace-nowrap px-4 pb-4 font-display text-[18vw] font-black uppercase leading-[0.8] text-white/[0.04]">Twisty Wrap</div>
    </footer>
  );
};
