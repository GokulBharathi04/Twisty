import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { CATALOGUE_PDF, cataloguePages } from "../lib/catalog";

const useIsDesktop = () => {
  const q = "(min-width: 768px)";
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
};

const Page = ({ i, side }) =>
  i == null ? (
    <div className="h-full w-full" />
  ) : (
    <div className={`relative h-full w-full overflow-hidden bg-white ${side === "l" ? "rounded-l-[10px]" : "rounded-r-[10px]"}`}>
      <img src={cataloguePages[i]?.src} alt={`Catalogue page ${i + 1}: ${cataloguePages[i]?.title}`} className="h-full w-full object-cover" draggable={false} />
      <div className={`pointer-events-none absolute inset-y-0 w-10 ${side === "l" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/15 to-transparent`} />
    </div>
  );

const Spreads = ({ s, setS, spreads }) => {
  const [flip, setFlip] = useState(null);
  const go = (dir) => {
    const to = s + dir;
    if (flip || to < 0 || to >= spreads.length) return;
    setFlip({ dir, to });
  };
  useEffect(() => {
    const k = (e) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const done = () => {
    setS(flip.to);
    setFlip(null);
  };
  const cur = spreads[s];
  const nxt = flip ? spreads[flip.to] : null;
  const left = flip ? (flip.dir === 1 ? cur[0] : nxt[0]) : cur[0];
  const right = flip ? (flip.dir === 1 ? nxt[1] : cur[1]) : cur[1];
  return (
    <div className="relative">
      <div className="relative mx-auto grid aspect-[1190/842] w-full max-w-[980px] grid-cols-2 [perspective:2400px]" data-testid="flipbook-spread">
        <div className={left == null ? "" : "shadow-[0_30px_60px_-30px_rgba(35,37,42,0.45)]"}><Page i={left} side="l" /></div>
        <div className={right == null ? "" : "shadow-[0_30px_60px_-30px_rgba(35,37,42,0.45)]"}><Page i={right} side="r" /></div>
        {flip && (
          <motion.div
            className={`absolute top-0 h-full w-1/2 [transform-style:preserve-3d] ${flip.dir === 1 ? "left-1/2 origin-left" : "left-0 origin-right"}`}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: flip.dir === 1 ? -180 : 180 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={done}
          >
            <div className="absolute inset-0 [backface-visibility:hidden]"><Page i={flip.dir === 1 ? cur[1] : cur[0]} side={flip.dir === 1 ? "r" : "l"} /></div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"><Page i={flip.dir === 1 ? nxt[0] : nxt[1]} side={flip.dir === 1 ? "l" : "r"} /></div>
          </motion.div>
        )}
      </div>
      <Controls onPrev={() => go(-1)} onNext={() => go(1)} label={`${s + 1} / ${spreads.length}`} prevOff={s === 0} nextOff={s === spreads.length - 1} />
    </div>
  );
};

const Single = ({ i, setI }) => {
  const [dir, setDir] = useState(1);
  const go = (d) => {
    const n = i + d;
    if (n < 0 || n >= cataloguePages.length) return;
    setDir(d);
    setI(n);
  };
  return (
    <div>
      <div className="relative mx-auto aspect-[595/842] w-full max-w-[420px] [perspective:1600px]" data-testid="flipbook-single">
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={i}
            className="absolute inset-0 origin-left overflow-hidden rounded-[10px] shadow-[0_24px_50px_-24px_rgba(35,37,42,0.5)]"
            initial={{ rotateY: dir === 1 ? 70 : -70, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={cataloguePages[i]?.src} alt={`Catalogue page ${i + 1}`} className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      <Controls onPrev={() => go(-1)} onNext={() => go(1)} label={`${i + 1} / ${cataloguePages.length}`} prevOff={i === 0} nextOff={i === cataloguePages.length - 1} />
    </div>
  );
};

const Controls = ({ onPrev, onNext, label, prevOff, nextOff }) => (
  <div className="mt-8 flex items-center justify-center gap-4">
    <button onClick={onPrev} disabled={prevOff} className="flex h-12 w-12 items-center justify-center rounded-full neu transition-opacity disabled:opacity-40" aria-label="Previous page" data-testid="flipbook-prev">
      <ChevronLeft className="h-5 w-5" />
    </button>
    <span className="min-w-[90px] rounded-full px-4 py-2.5 text-center font-mono text-xs shadow-neu-in-sm" data-testid="flipbook-page-indicator">{label}</span>
    <button onClick={onNext} disabled={nextOff} className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-neu-red transition-opacity disabled:opacity-40" aria-label="Next page" data-testid="flipbook-next">
      <ChevronRight className="h-5 w-5" />
    </button>
    <a href={CATALOGUE_PDF} download className="btn-neu ml-2 hidden px-5 py-3 text-xs sm:inline-flex" data-testid="flipbook-download">
      <Download className="h-4 w-4" /> PDF
    </a>
  </div>
);

export const FlipBook = () => {
  const desktop = useIsDesktop();
  const spreads = useMemo(() => {
    const n = cataloguePages.length;
    const out = [[null, 0]];
    for (let p = 1; p < n; p += 2) out.push([p, p + 1 < n ? p + 1 : null]);
    return out;
  }, []);
  const [s, setS] = useState(0);
  const [i, setI] = useState(0);
  if (!cataloguePages.length) return null;
  return (
    <div data-testid="catalogue-flipbook">
      {desktop ? <Spreads s={s} setS={setS} spreads={spreads} /> : <Single i={i} setI={setI} />}
      <div className="no-scrollbar mt-8 flex gap-3 overflow-x-auto px-1 pb-3" data-lenis-prevent>
        {cataloguePages.map((p, k) => {
          const active = desktop ? spreads[s].includes(k) : i === k;
          return (
            <button
              key={p.src}
              onClick={() => (desktop ? setS(Math.floor((k + 1) / 2)) : setI(k))}
              className={`w-14 shrink-0 overflow-hidden rounded-md transition-[transform,box-shadow] ${active ? "-translate-y-1 ring-2 ring-brand" : "opacity-70 hover:opacity-100"}`}
              aria-label={`Go to page ${k + 1}: ${p.title}`}
              data-testid={`flipbook-thumb-${k + 1}`}
            >
              <img src={p.src} alt="" loading="lazy" className="aspect-[595/842] w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
