import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 28, className = "", as = "div" }) => {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </M>
  );
};

export const MaskLines = ({ lines, className = "", delay = 0.15, animateOnMount = false }) => (
  <motion.span
    className={`block ${className}`}
    initial="hidden"
    {...(animateOnMount ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.1 } })}
  >
    {lines.map((line, i) => (
      <span key={i} className="line-mask">
        <motion.span
          className="block"
          variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
          transition={{ duration: 1.05, delay: delay + i * 0.12, ease }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </motion.span>
);

export const SectionHead = ({ eyebrow, title, text, light = false, className = "" }) => (
  <div className={`max-w-3xl ${className}`}>
    <Reveal>
      <p className={`eyebrow flex items-center gap-3 ${light ? "text-zinc-300" : ""}`}>
        <span className="h-2.5 w-2.5 rounded-[3px] bg-brand" />
        {eyebrow}
      </p>
    </Reveal>
    <h2 className={`mt-5 text-3xl font-extrabold uppercase leading-[0.98] tracking-tight sm:text-4xl lg:text-5xl ${light ? "text-white" : "text-brand-ink"}`}>
      <MaskLines lines={Array.isArray(title) ? title : [title]} />
    </h2>
    {text && (
      <Reveal delay={0.15}>
        <p className={`mt-5 max-w-2xl text-sm leading-relaxed sm:text-base ${light ? "text-zinc-300" : "text-brand-grey"}`}>{text}</p>
      </Reveal>
    )}
  </div>
);
