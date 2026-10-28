import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { siteUrl } from "@/lib/format";
import { listPublishedSlugs } from "@/server/products/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await listPublishedSlugs();

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/catalogue`, changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORIES.map((category) => ({
      url: `${base}/catalogue/${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
    ...products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
