import "server-only";
import { cache } from "react";
import { and, asc, desc, eq } from "drizzle-orm";
import type { Category } from "@/lib/categories";
import { getDb } from "../db";
import { productDocuments, productImages, productSpecs, products } from "../db/schema";
import { withBuildFallback } from "./build-fallback";
import type { ProductCardData, ProductDetailData } from "./types";

type CardRow = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  hsCode: string | null;
  description: string;
  coverPublicId: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
};

export function toCardData(row: CardRow): ProductCardData {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    hsCode: row.hsCode,
    description: row.description,
    cover:
      row.coverPublicId && row.coverWidth && row.coverHeight
        ? {
            publicId: row.coverPublicId,
            altText: row.coverAlt ?? row.name,
            width: row.coverWidth,
            height: row.coverHeight,
          }
        : null,
  };
}

export const cardColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  category: products.category,
  hsCode: products.hsCode,
  description: products.description,
  coverPublicId: productImages.cloudinaryPublicId,
  coverAlt: productImages.altText,
  coverWidth: productImages.width,
  coverHeight: productImages.height,
};

export async function listPublishedProducts(options: { category?: Category; limit?: number } = {}): Promise<
  ProductCardData[]
> {
  return withBuildFallback(async () => {
    const rows = await getDb()
      .select(cardColumns)
      .from(products)
      .leftJoin(productImages, eq(productImages.id, products.coverImageId))
      .where(and(eq(products.status, "published"), options.category ? eq(products.category, options.category) : undefined))
      .orderBy(asc(products.sortOrder), desc(products.createdAt))
      .limit(options.limit ?? 200);
    return rows.map(toCardData);
  }, []);
}

// Wrapped in cache() so generateMetadata and the page share one database round trip.
export const getPublishedProductBySlug = cache(async (slug: string): Promise<ProductDetailData | null> => {
  return withBuildFallback(async () => {
    const db = getDb();
    const [row] = await db
      .select({ ...cardColumns, status: products.status, coverImageId: products.coverImageId, createdAt: products.createdAt, updatedAt: products.updatedAt })
      .from(products)
      .leftJoin(productImages, eq(productImages.id, products.coverImageId))
      .where(and(eq(products.slug, slug), eq(products.status, "published")))
      .limit(1);
    if (!row) return null;

    const [specs, images, documents] = await Promise.all([
      db
        .select({ id: productSpecs.id, label: productSpecs.label, value: productSpecs.value })
        .from(productSpecs)
        .where(eq(productSpecs.productId, row.id))
        .orderBy(asc(productSpecs.position)),
      db
        .select({
          id: productImages.id,
          publicId: productImages.cloudinaryPublicId,
          url: productImages.url,
          width: productImages.width,
          height: productImages.height,
          altText: productImages.altText,
        })
        .from(productImages)
        .where(eq(productImages.productId, row.id))
        .orderBy(asc(productImages.position)),
      db
        .select({
          id: productDocuments.id,
          publicId: productDocuments.cloudinaryPublicId,
          url: productDocuments.url,
          title: productDocuments.title,
        })
        .from(productDocuments)
        .where(eq(productDocuments.productId, row.id))
        .orderBy(asc(productDocuments.title)),
    ]);

    return { ...toCardData(row), status: row.status, coverImageId: row.coverImageId, createdAt: row.createdAt, updatedAt: row.updatedAt, specs, images, documents };
  }, null);
});

export async function listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return withBuildFallback(
    () =>
      getDb()
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(eq(products.status, "published"))
        .orderBy(desc(products.updatedAt)),
    [],
  );
}
