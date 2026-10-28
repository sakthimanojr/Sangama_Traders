import Link from "next/link";
import { site } from "@/config/site";
import { CATEGORIES, categoryLabels } from "@/lib/categories";

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white text-ink-800">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.5fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo.full} alt={site.name} width={site.logo.fullWidth} height={site.logo.fullHeight} className="h-14 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">{site.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-deep-blue">Company</p>
          <ul className="mt-4 space-y-2 text-sm">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-deep-blue">Products</p>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link href={`/catalogue/${category}`} className="hover:text-brand-600">
                  {categoryLabels[category]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-deep-blue">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`tel:${site.contact.phone.replace(/\s+/g, "")}`} className="hover:text-brand-600">
                {site.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="hover:text-brand-600">
                {site.contact.email}
              </a>
            </li>
            <li className="text-ink-700">{site.contact.address}</li>
            <li className="text-ink-700">{site.contact.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-200 py-5 text-center text-xs text-ink-500">
        &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
