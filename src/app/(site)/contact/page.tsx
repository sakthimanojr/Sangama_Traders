import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { PageIntro } from "@/components/public/PageIntro";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Send an enquiry to ${site.name} or reach us by email, phone or WhatsApp.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact } = site;

  return (
    <>
      <PageIntro title="Contact us">Tell us what you need and we will reply with pricing and availability.</PageIntro>

      <section className="container-page grid gap-10 py-12 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <aside className="space-y-5 text-sm lg:col-span-2">
          <div>
            <h2 className="text-base font-semibold">Email</h2>
            <a href={`mailto:${contact.email}`} className="text-brand-600 hover:text-brand-700">
              {contact.email}
            </a>
          </div>
          <div>
            <h2 className="text-base font-semibold">Phone</h2>
            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-brand-600 hover:text-brand-700">
              {contact.phone}
            </a>
          </div>
          {contact.whatsapp ? (
            <div>
              <h2 className="text-base font-semibold">WhatsApp</h2>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener"
                className="text-brand-600 hover:text-brand-700"
              >
                Message us on WhatsApp
              </a>
            </div>
          ) : null}
          <div>
            <h2 className="text-base font-semibold">Address</h2>
            <p className="text-ink-700">{contact.address}</p>
          </div>
          <div>
            <h2 className="text-base font-semibold">Business hours</h2>
            <p className="text-ink-700">{contact.hours}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
