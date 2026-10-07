import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { useSeo } from "../hooks/useSeo";
import { MaskLines, Reveal } from "../components/Reveal";
import { PageHero } from "../components/Sections";
import { EnquiryForm } from "../components/EnquiryForm";
import { CONTACT } from "../lib/catalog";

const ITEMS = [
  { Icon: Phone, k: "Phone", v: CONTACT.phone },
  { Icon: Mail, k: "Email", v: CONTACT.email },
  { Icon: Globe, k: "Website", v: CONTACT.website },
  { Icon: MapPin, k: "Address", v: CONTACT.address },
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
        <div className="space-y-4 lg:col-span-4">
          <p className="eyebrow">Twisty Wrap Enterprises</p>
          {ITEMS.map((it, i) => (
            <Reveal key={it.k} delay={i * 0.06}>
              <div className="flex items-center gap-4 rounded-[22px] p-5 neu" data-testid={`contact-${it.k.toLowerCase()}`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white"><it.Icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-brand-grey">{it.k}</p>
                  <p className="font-display text-lg font-bold">{it.v}</p>
                </div>
              </div>
            </Reveal>
          ))}
          <div className="flex aspect-[4/3] items-center justify-center rounded-[22px] p-6 text-center neu-in" data-testid="contact-map-placeholder">
            <p className="text-sm text-brand-grey">The location map will appear here once the business address is added.</p>
          </div>
        </div>
        <Reveal className="lg:col-span-8">
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
