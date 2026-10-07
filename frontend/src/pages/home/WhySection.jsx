import { Reveal, SectionHead } from "../../components/Reveal";

const REASONS = [
  { t: "A consultative approach", d: "We start with what you ship — weight, fragility, route and storage — and help you identify the right film, honeycomb, cartons and quantities." },
  { t: "One supplier, many needs", d: "Packaging materials, industrial printing, display boards, thermal rolls and workplace safety supplies from a single point of contact." },
  { t: "Made to your specification", d: "Custom-sized and printed cartons, CNC die-cut foams, honeycomb built to requirement and custom-printed labels." },
  { t: "Responsible material options", d: "Bio-degradable, recyclable and eco-friendly printing options presented with factual, honest language." },
];

export const WhySection = () => (
  <section className="relative overflow-hidden bg-[#1E2026] py-24 text-white sm:py-32" data-testid="why-section">
    <div aria-hidden className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-brand/20 blur-[120px]" />
    <div className="wrap relative grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
        <SectionHead light eyebrow="Why Twisty Wrap Enterprises" title={["Protect.", "Package.", "Perform.", "Sustain."]} text="Our closing promise in every catalogue is simple: help you choose the right packaging for what you ship — and keep supplying it dependably." />
      </div>
      <div className="space-y-5 lg:col-span-7">
        {REASONS.map((r, i) => (
          <Reveal key={r.t} delay={i * 0.06}>
            <div className="group flex gap-6 rounded-[26px] bg-[#25282F] p-7 shadow-[8px_8px_20px_#16181c,-8px_-8px_20px_#2c3038] transition-colors duration-500 hover:bg-[#2A2D35] sm:p-9" data-testid={`why-reason-${i + 1}`}>
              <span className="font-display text-4xl font-black text-brand sm:text-5xl">0{i + 1}</span>
              <div>
                <h3 className="text-xl font-extrabold uppercase sm:text-2xl">{r.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{r.d}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
