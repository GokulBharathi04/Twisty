import { Link } from "react-router-dom";
import { asset } from "../lib/asset";

export const Logo = ({ light = false, compact = false }) => (
  <Link to="/" className="group flex items-center gap-3" data-testid="header-logo-link" aria-label="Twisty Wrap Enterprises home">
    <img src={asset("/logo-mark.png")} alt="Twisty Wrap Enterprises logo" className={`${compact ? "h-9" : "h-10"} w-auto transition-transform duration-500 group-hover:rotate-[-6deg]`} />
    <span className="font-display font-extrabold uppercase leading-[0.9] tracking-tight">
      <span className={`block text-[17px] ${light ? "text-white" : "text-brand-grey"}`}>Twisty Wrap</span>
      <span className="block text-[13px] tracking-[0.08em] text-brand">Enterprises</span>
    </span>
  </Link>
);
