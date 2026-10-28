import Link from "next/link";
import { site } from "@/config/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const phoneHref = `tel:${site.contact.phone.replace(/\s+/g, "")}`;

function Brand() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={site.logo.full}
      alt={site.name}
      width={site.logo.fullWidth}
      height={site.logo.fullHeight}
      className="h-12 w-auto sm:h-14"
    />
  );
}

// No JavaScript: the mobile menu uses the native <details> element.
export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${site.name} home`}>
          <Brand />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-ink-800 hover:text-brand-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a href={phoneHref} className="text-sm font-medium text-ink-900 underline underline-offset-4 hover:text-brand-600">
            Call {site.contact.phone}
          </a>
          <Link href="/contact" className="btn btn-pill btn-primary">
            Request a Quote
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-white" />
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary className="btn btn-pill btn-secondary cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <nav aria-label="Mobile" className="card absolute right-0 z-20 mt-2 w-64 p-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50"
              >
                {link.label}
              </Link>
            ))}
            <a href={phoneHref} className="block rounded-md px-3 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50">
              Call {site.contact.phone}
            </a>
            <Link href="/contact" className="btn btn-pill btn-primary mt-2 w-full">
              Request a Quote
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
