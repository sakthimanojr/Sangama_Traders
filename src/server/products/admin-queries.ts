import "server-only";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Category, Status } from "@/lib/categories";
import { getDb } from "../db";
import { enquiries, productDocuments, productImages, productSpecs, products } from "../db/schema";
import { cardColumns, toCardData } from "./queries";
import type { ProductCardData, ProductDetailData } from "./types";

export type AdminProductRow = ProductCardData & { status: Status; updatedAt: Date };

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function listAdminProducts(filters: { q?: string; category?: Category }): Promise<AdminProductRow[]> {
  const term = filters.q?.trim();
  const pattern = term ? `%${escapeLike(term)}%` : undefined;

  const rows = await getDb()
    .select({ ...cardColumns, status: products.status, updatedAt: products.updatedAt })
    .from(products)
    .leftJoin(productImages, eq(productImages.id, products.coverImageId))
    .where(
      and(
        filters.category ? eq(products.category, filters.category) : undefined,
        pattern
          ? or(ilike(products.name, pattern), ilike(products.hsCode, pattern), ilike(products.slug, pattern))
          : undefined,
      ),
    )
    .orderBy(desc(products.updatedAt))
    .limit(500);

  return rows.map((row) => ({ ...toCardData(row), status: row.status, updatedAt: row.updatedAt }));
}

export async function getProductForEdit(id: string): Promise<ProductDetailData | null> {
  const db = getDb();
  const [row] = await db
    .select({
      ...cardColumns,
      status: products.status,
      coverImageId: products.coverImageId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(productImages, eq(productImages.id, products.coverImageId))
    .where(eq(products.id, id))
    .limit(1);
  if (!row) return null;

  const [specs, images, documents] = await Promise.all([
    db
      .select({ id: productSpecs.id, label: productSpecs.label, value: productSpecs.value })
      .from(productSpecs)
      .where(eq(productSpecs.productId, id))
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
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.position)),
    db
      .select({
        id: productDocuments.id,
        publicId: productDocuments.cloudinaryPublicId,
        url: productDocuments.url,
        title: productDocuments.title,
      })
      .from(productDocuments)
      .where(eq(productDocuments.productId, id))
      .orderBy(asc(productDocuments.title)),
  ]);

  return {
    ...toCardData(row),
    status: row.status,
    coverImageId: row.coverImageId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    specs,
    images,
    documents,
  };
}

export type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  createdAt: Date;
  productName: string | null;
  productSlug: string | null;
};

export const ENQUIRIES_PAGE_SIZE = 50;

export async function listEnquiries(page: number): Promise<{ rows: EnquiryRow[]; total: number }> {
  const db = getDb();
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: enquiries.id,
        name: enquiries.name,
        email: enquiries.email,
        company: enquiries.company,
        message: enquiries.message,
        createdAt: enquiries.createdAt,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(enquiries)
      .leftJoin(products, eq(products.id, enquiries.productId))
      .orderBy(desc(enquiries.createdAt))
      .limit(ENQUIRIES_PAGE_SIZE)
      .offset((page - 1) * ENQUIRIES_PAGE_SIZE),
    db.select({ value: count() }).from(enquiries),
  ]);
  return { rows, total: totals[0]?.value ?? 0 };
}
