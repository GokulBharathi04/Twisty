import { Suspense, lazy, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Leaf } from "lucide-react";
import { MaskLines } from "../../components/Reveal";
import { useEnquiry } from "../../components/EnquiryContext";

const Hero3D = lazy(() => import("../../components/Hero3D"));
const ease = [0.22, 1, 0.36, 1];

const Fallback = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-40 w-40 animate-pulse rounded-[32px] neu" />
  </div>
);

export const HeroSection = () => {
  const { openEnquiry } = useEnquiry();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section ref={ref} className="relative overflow-hidden pb-10 pt-28 sm:pt-36 lg:min-h-[100svh] lg:pb-16" data-testid="hero-section">
      <motion.div aria-hidden style={{ y: wordY }} className="pointer-events-none absolute -right-[4vw] top-[16%] hidden select-none font-display font-black uppercase leading-none text-transparent [-webkit-text-stroke:2px_#D3D9E1] lg:block lg:text-[22vw]">
        Wrap
      </motion.div>
      <div className="wrap relative grid items-center gap-6 lg:grid-cols-12">
        <div className="relative z-10 lg:col-span-7">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="eyebrow flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-brand" /> Packaging · Printing · Industrial supplies
          </motion.p>
          <h1 className="mt-6 text-[2.6rem] font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-[5.4rem]" data-testid="hero-headline">
            <MaskLines animateOnMount delay={0.2} lines={["Packaging", <>solutions built</>, <>to <span className="text-brand">protect</span></>, "what matters"]} />
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.85, ease }} className="mt-7 max-w-xl text-sm leading-relaxed text-brand-grey sm:text-base">
            From warehouse handling to final delivery, Twisty Wrap Enterprises provides dependable packaging, industrial supplies and sustainable material solutions designed around the way your business operates.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1, ease }} className="mt-9 flex flex-wrap gap-3">
            <Link to="/products" className="btn-red" data-testid="hero-explore-products-btn">Explore products <ArrowUpRight className="h-4 w-4" /></Link>
            <button className="btn-neu" onClick={() => openEnquiry("")} data-testid="hero-enquiry-btn">Request an enquiry</button>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.2 }} className="mt-12 hidden max-w-xl grid-cols-4 gap-3 sm:grid">
            {["Protect", "Package", "Perform", "Sustain"].map((w, i) => (
              <li key={w} className="rounded-2xl px-3 py-3 shadow-neu-in-sm">
                <span className="font-mono text-[10px] text-brand">0{i + 1}</span>
                <span className="block font-display text-sm font-extrabold uppercase">{w}</span>
              </li>
            ))}
          </motion.ul>
        </div>
        <motion.div style={{ y: sceneY }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.3, ease }} className="relative h-[360px] sm:h-[480px] lg:col-span-5 lg:h-[620px]">
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[88%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full neu-in" />
          <div aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[62%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full neu" />
          <div className="absolute inset-0">
            <Suspense fallback={<Fallback />}>
              <Hero3D />
            </Suspense>
          </div>
          <div className="absolute bottom-4 left-2 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/40 px-4 py-3 shadow-neu-sm backdrop-blur-xl sm:bottom-10 sm:left-0" data-testid="hero-glass-card">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white"><Leaf className="h-4 w-4" /></span>
            <span className="text-xs leading-tight"><b className="block font-display text-sm uppercase">Bio-degradable film</b>available alongside LLDPE</span>
          </div>
        </motion.div>
      </div>
      <div className="wrap mt-6 hidden items-center gap-3 lg:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-full neu"><ArrowDown className="h-4 w-4 animate-bounce text-brand" /></span>
        <span className="eyebrow">Scroll to explore · drag your cursor over the pallet</span>
      </div>
    </section>
  );
};
