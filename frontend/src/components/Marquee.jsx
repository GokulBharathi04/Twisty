export const Marquee = ({ items, dark = false }) => {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`relative overflow-hidden py-7 sm:py-9 ${dark ? "bg-brand-ink" : ""}`} data-testid="editorial-marquee">
      <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center gap-10" aria-hidden={k === 1}>
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span
                  className={`font-display text-4xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl ${
                    i % 2 ? "text-transparent [-webkit-text-stroke:1.5px_#9AA0A9]" : dark ? "text-white" : "text-brand-ink"
                  }`}
                >
                  {t}
                </span>
                <span className="h-4 w-4 rotate-45 rounded-[3px] bg-brand sm:h-5 sm:w-5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
