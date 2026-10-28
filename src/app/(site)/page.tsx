import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/public/CtaBand";
import { Hero } from "@/components/public/Hero";
import { ProductCard } from "@/components/public/ProductCard";
import { SectionTitle } from "@/components/public/SectionTitle";
import { site } from "@/config/site";
import { CATEGORIES, categoryBlurbs, categoryLabels } from "@/lib/categories";
import { listPublishedProducts } from "@/server/products/queries";

// Rebuilt immediately when you publish or edit a product. The hourly refresh is only a safety net.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${site.name} | ${site.tagline}` },
  alternates: { canonical: "/" },
};

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-deep-blue" fill="currentColor">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

// "Southeast Asia (Indonesia, ...)" is shown as a name with a smaller detail line.
function splitMarket(market: string): { name: string; detail: string | null } {
  const open = market.indexOf(" (");
  if (open === -1) return { name: market, detail: null };
  return { name: market.slice(0, open), detail: market.slice(open + 2).replace(/\)$/, "") };
}

export default async function HomePage() {
  const latest = await listPublishedProducts({ limit: 6 });
  const { majorProducts, why } = site;

  return (
    <>
      <Hero />

      <section className="container-page py-20">
        <SectionTitle title="What we trade">Fresh fruits and vegetables, sourced directly from growers.</SectionTitle>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/catalogue/${category}`}
              className="card group block border-t-4 border-t-deep-blue p-7 transition-shadow hover:shadow-lg"
            >
              <h3 className="text-3xl font-semibold uppercase tracking-wide">{categoryLabels[category]}</h3>
              <p className="mt-2 text-sm text-ink-700">{categoryBlurbs[category]}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {majorProducts[category].map((name) => (
                  <li key={name} className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-800">
                    {name}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-block text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                View products &rarr;
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-600">{majorProducts.note}</p>
      </section>

      <section className="bg-ink-50 py-20">
        <div className="container-page">
          <SectionTitle title={why.headline}>{why.intro}</SectionTitle>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {why.items.map((item) => (
              <article key={item.title} className="group relative aspect-[4/5] overflow-hidden rounded-xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt=""
                  width={800}
                  height={960}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-deep-navy/85 via-deep-navy/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-4xl font-semibold uppercase tracking-wide text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/85">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {latest.length > 0 ? (
        <section className="container-page py-20">
          <SectionTitle title="Latest products" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/catalogue" className="btn btn-pill btn-secondary">
              See all products
            </Link>
          </div>
        </section>
      ) : null}

      <section className="container-page pb-4 pt-20">
        <SectionTitle title="Markets we serve">
          Supplying buyers across Asia and the Middle East, and all over India.
        </SectionTitle>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.targetMarkets.map((market) => {
            const { name, detail } = splitMarket(market);
            return (
              <li key={market} className="card flex items-start gap-3 p-5 shadow-md">
                <PinIcon />
                <div>
                  <p className="font-display text-2xl font-semibold leading-tight text-ink-950">{name}</p>
                  {detail ? <p className="mt-1 text-xs leading-relaxed text-ink-600">{detail}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <CtaBand />
    </>
  );
}
