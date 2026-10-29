import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useEnquiry } from "./EnquiryContext";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  // hover: the eco range hovers in the bio catalogue's teal instead of brand red
  { to: "/sustainability", label: "Sustainable Products", hover: "hover:text-[#2A6B5C]" },
  { to: "/applications", label: "Applications" },
  { to: "/contact", label: "Contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openEnquiry } = useEnquiry();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5" data-testid="site-header">
      <div
        className={`mx-auto flex max-w-[1320px] items-center justify-between rounded-[22px] px-4 transition-[padding,box-shadow,background-color] duration-500 sm:px-6 ${
          scrolled ? "bg-brand-base/90 py-2.5 shadow-neu backdrop-blur-xl" : "bg-brand-base/70 py-4 backdrop-blur-md"
        }`}
      >
        <Logo compact={scrolled} />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`nav-${n.label.toLowerCase()}-link`}
              className={({ isActive }) =>
                `relative rounded-full px-3.5 py-2 font-display text-[13px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  isActive ? "text-brand shadow-neu-in-sm" : `text-brand-ink ${n.hover || "hover:text-brand"}`
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="btn-red hidden px-5 py-3 text-xs sm:inline-flex" onClick={() => openEnquiry("")} data-testid="header-enquiry-button">
            Request an enquiry
          </button>
          <button className="flex h-11 w-11 items-center justify-center rounded-full neu xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" data-testid="mobile-menu-toggle">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-2 max-w-[1320px] rounded-[22px] bg-brand-base p-4 shadow-neu xl:hidden"
          data-testid="mobile-menu"
        >
          {NAV.map((n, i) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`mobile-nav-${n.label.toLowerCase()}-link`}
              className={({ isActive }) => `flex items-center justify-between border-b border-black/5 px-2 py-3.5 font-display text-lg font-extrabold uppercase ${isActive ? "text-brand" : "text-brand-ink"}`}
            >
              {n.label} <span className="font-mono text-xs text-brand-grey">0{i + 1}</span>
            </NavLink>
          ))}
          <button className="btn-red mt-4 w-full" onClick={() => openEnquiry("")} data-testid="mobile-enquiry-button">Request an enquiry</button>
        </motion.nav>
      )}
    </header>
  );
};
