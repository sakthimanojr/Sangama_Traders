import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CloudImage } from "@/components/public/CloudImage";
import { JsonLd } from "@/components/public/JsonLd";
import { site } from "@/config/site";
import { categoryLabels } from "@/lib/categories";
import { fullImageUrl, ogImageUrl } from "@/lib/cloudinary-url";
import { siteUrl } from "@/lib/format";
import { getPublishedProductBySlug, listPublishedSlugs } from "@/server/products/queries";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((row) => ({ slug: row.slug }));
}

function summarise(text: string, fallback: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  return clean.length > 160 ? `${clean.slice(0, 157)}...` : clean;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description = summarise(product.description, `${product.name} from ${site.name}.`);
  const image = product.cover ? ogImageUrl(product.cover.publicId) : undefined;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.cover?.altText ?? product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  const [first, ...rest] = product.images;
  const url = `${siteUrl()}/products/${product.slug}`;

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: summarise(product.description, product.name),
    url,
    category: categoryLabels[product.category],
    brand: { "@type": "Organization", name: site.name },
    image: product.images.map((image) => fullImageUrl(image.publicId)),
    additionalProperty: [
      ...(product.hsCode ? [{ "@type": "PropertyValue", name: "HS code", value: product.hsCode }] : []),
      ...product.specs.map((spec) => ({ "@type": "PropertyValue", name: spec.label, value: spec.value })),
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="container-page py-8">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-600">
          <Link href="/catalogue" className="hover:text-brand-600">
            Catalogue
          </Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/catalogue/${product.category}`} className="hover:text-brand-600">
            {categoryLabels[product.category]}
          </Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-50">
              {first ? (
                <CloudImage
                  publicId={first.publicId}
                  alt={first.altText}
                  fill
                  priority
                  sizes="(min-width: 1024px) 552px, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-ink-400">No photo yet</div>
              )}
            </div>

            {rest.length > 0 ? (
              <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {rest.map((image) => (
                  <li key={image.id}>
                    <a
                      href={fullImageUrl(image.publicId)}
                      target="_blank"
                      rel="noopener"
                      className="relative block aspect-square overflow-hidden rounded-lg bg-ink-50"
                    >
                      <CloudImage
                        publicId={image.publicId}
                        alt={image.altText}
                        fill
                        loading="lazy"
                        sizes="(min-width: 1024px) 130px, 30vw"
                        className="object-cover"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {categoryLabels[product.category]}
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{product.name}</h1>
            {product.hsCode ? (
              <p className="mt-3 inline-block rounded-md bg-ink-50 px-3 py-1 text-sm font-medium text-ink-800">
                HS code: {product.hsCode}
              </p>
            ) : null}

            {product.description ? (
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-ink-800">{product.description}</p>
            ) : null}

            <Link
              href={`/contact?product=${encodeURIComponent(product.slug)}&name=${encodeURIComponent(product.name)}`}
              className="btn btn-primary mt-6"
            >
              Enquire about this product
            </Link>

            {product.specs.length > 0 ? (
              <section className="mt-10" aria-labelledby="specs-heading">
                <h2 id="specs-heading" className="text-xl font-semibold">
                  Specifications
                </h2>
                <table className="mt-3 w-full border-collapse text-sm">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.id} className="border-t border-ink-100">
                        <th scope="row" className="w-2/5 py-2.5 pr-4 text-left font-medium text-ink-700">
                          {spec.label}
                        </th>
                        <td className="py-2.5 text-ink-900">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}

            {product.documents.length > 0 ? (
              <section className="mt-10" aria-labelledby="docs-heading">
                <h2 id="docs-heading" className="text-xl font-semibold">
                  Documents
                </h2>
                <ul className="mt-3 space-y-2">
                  {product.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        <span aria-hidden="true">PDF</span>
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
