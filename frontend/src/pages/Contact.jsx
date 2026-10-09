import { Globe, Mail, MapPin, Phone, Users } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal } from "../components/Reveal";
import { PageHero } from "../components/Sections";
import { EnquiryForm } from "../components/EnquiryForm";
import { CONTACT, PARTNERS } from "../lib/catalog";

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(CONTACT.address)}&output=embed`;

const ITEMS = [
  { Icon: Phone, k: "Phone", v: CONTACT.phones.map((p) => <a key={p} href={`tel:+91${p}`} className="block hover:text-brand">+91 {p}</a>) },
  { Icon: Mail, k: "Email", v: <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-brand">{CONTACT.email}</a> },
  { Icon: MapPin, k: "Address", v: CONTACT.address },
  { Icon: Users, k: "Managing Partners", v: PARTNERS.map((p) => <span key={p} className="block">{p}</span>) },
  { Icon: Globe, k: "Website", v: CONTACT.website },
];

export default function Contact() {
  useSeo("Contact & Enquiries", "Contact Twisty Wrap Enterprises or send a product enquiry for packaging, printing and industrial supplies.");
  return (
    <>
      <PageHero
        eyebrow="Contact · Enquire"
        title={<MaskLines animateOnMount lines={["Tell us what", <>you <span className="text-brand">ship.</span></>]} />}
        text="Share your product, quantities and specification — our team will review your requirements and get back to you shortly."
      />
      <section className="wrap grid gap-8 py-16 lg:grid-cols-12">
        <div className="min-w-0 space-y-4 lg:col-span-4">
          <p className="eyebrow">Twisty Wrap Enterprises</p>
          {ITEMS.map((it, i) => (
            <Reveal key={it.k} delay={i * 0.06}>
              <div className="flex items-center gap-4 rounded-[22px] p-5 neu" data-testid={`contact-${it.k.toLowerCase().replace(" ", "-")}`}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white"><it.Icon className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-brand-grey">{it.k}</p>
                  <div className="font-display text-base font-bold leading-snug">{it.v}</div>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="overflow-hidden rounded-[22px] p-2 neu-in" data-testid="contact-map">
            <iframe title="Twisty Wrap Enterprises location" src={MAP_SRC} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-[18px] border-0" />
          </div>
        </div>
        <Reveal className="min-w-0 lg:col-span-8">
          <div className="rounded-[30px] p-6 neu sm:p-10">
            <h2 className="text-3xl font-black uppercase">Product enquiry</h2>
            <p className="mb-8 mt-2 text-sm text-brand-grey">Fields marked * are required.</p>
            <EnquiryForm product="" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
