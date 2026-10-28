import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, like, notInArray } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { slugify } from "@/lib/slug";
import type { ProductInput } from "@/lib/validation/product";
import { getDb } from "../db";
import { productDocuments, productImages, productSpecs, products } from "../db/schema";

type Batch = [BatchItem<"pg">, ...BatchItem<"pg">[]];

type ImageWithId = ProductInput["images"][number] & { id: string };
type DocumentWithId = ProductInput["documents"][number] & { id: string };

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const rows = await getDb()
    .select({ slug: products.slug })
    .from(products)
    .where(like(products.slug, `${base}%`));
  const taken = new Set(rows.map((row) => row.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

function pickCoverId(images: ImageWithId[]): string | null {
  return (images.find((image) => image.isCover) ?? images[0])?.id ?? null;
}

function imageRows(productId: string, images: ImageWithId[]) {
  return images.map((image, index) => ({
    id: image.id,
    productId,
    cloudinaryPublicId: image.publicId,
    url: image.url,
    width: image.width,
    height: image.height,
    altText: image.altText,
    position: index,
  }));
}

function specRows(productId: string, specs: ProductInput["specs"]) {
  return specs.map((spec, index) => ({ productId, label: spec.label, value: spec.value, position: index }));
}

function documentRows(productId: string, documents: DocumentWithId[]) {
  return documents.map((doc) => ({
    id: doc.id,
    productId,
    cloudinaryPublicId: doc.publicId,
    url: doc.url,
    title: doc.title,
  }));
}

export async function createProduct(input: ProductInput): Promise<{ id: string; slug: string }> {
  const db = getDb();
  const id = randomUUID();
  const slug = await uniqueSlug(input.name);
  const images: ImageWithId[] = input.images.map((image) => ({ ...image, id: randomUUID() }));
  const documents: DocumentWithId[] = input.documents.map((doc) => ({ ...doc, id: randomUUID() }));

  const statements: BatchItem<"pg">[] = [
    db.insert(products).values({
      id,
      slug,
      name: input.name,
      category: input.category,
      hsCode: input.hsCode || null,
      description: input.description,
      status: input.status,
      coverImageId: pickCoverId(images),
    }),
  ];
  if (input.specs.length > 0) statements.push(db.insert(productSpecs).values(specRows(id, input.specs)));
  if (images.length > 0) statements.push(db.insert(productImages).values(imageRows(id, images)));
  if (documents.length > 0) statements.push(db.insert(productDocuments).values(documentRows(id, documents)));

  // One batch is one database transaction: either everything is saved or nothing is.
  await db.batch(statements as Batch);
  return { id, slug };
}

export type UpdateResult = { slug: string; removedPublicIds: string[] };

export async function updateProduct(id: string, input: ProductInput): Promise<UpdateResult | null> {
  const db = getDb();
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return null;

  const [oldImages, oldDocuments] = await Promise.all([
    db
      .select({ id: productImages.id, publicId: productImages.cloudinaryPublicId })
      .from(productImages)
      .where(eq(productImages.productId, id)),
    db
      .select({ id: productDocuments.id, publicId: productDocuments.cloudinaryPublicId })
      .from(productDocuments)
      .where(eq(productDocuments.productId, id)),
  ]);
  const oldImageIds = new Set(oldImages.map((row) => row.id));
  const oldDocumentIds = new Set(oldDocuments.map((row) => row.id));

  const images: ImageWithId[] = input.images.map((image) => ({
    ...image,
    id: image.id && oldImageIds.has(image.id) ? image.id : randomUUID(),
  }));
  const documents: DocumentWithId[] = input.documents.map((doc) => ({
    ...doc,
    id: doc.id && oldDocumentIds.has(doc.id) ? doc.id : randomUUID(),
  }));

  const keptImageIds = new Set(images.map((image) => image.id));
  const keptDocumentIds = new Set(documents.map((doc) => doc.id));
  const removedPublicIds = [
    ...oldImages.filter((row) => !keptImageIds.has(row.id)).map((row) => row.publicId),
    ...oldDocuments.filter((row) => !keptDocumentIds.has(row.id)).map((row) => row.publicId),
  ];

  const statements: BatchItem<"pg">[] = [
    db
      .update(products)
      .set({
        name: input.name,
        category: input.category,
        hsCode: input.hsCode || null,
        description: input.description,
        status: input.status,
        coverImageId: pickCoverId(images),
        updatedAt: new Date(),
      })
      .where(eq(products.id, id)),
    db.delete(productSpecs).where(eq(productSpecs.productId, id)),
  ];
  if (input.specs.length > 0) statements.push(db.insert(productSpecs).values(specRows(id, input.specs)));

  // Images: remove the ones no longer present, update the ones kept, insert the new ones.
  const keptImageList = [...keptImageIds];
  statements.push(
    keptImageList.length > 0
      ? db
          .delete(productImages)
          .where(and(eq(productImages.productId, id), notInArray(productImages.id, keptImageList)))
      : db.delete(productImages).where(eq(productImages.productId, id)),
  );
  const imageData = imageRows(id, images);
  for (const row of imageData) {
    if (oldImageIds.has(row.id)) {
      statements.push(
        db
          .update(productImages)
          .set({ altText: row.altText, position: row.position })
          .where(eq(productImages.id, row.id)),
      );
    }
  }
  const newImages = imageData.filter((row) => !oldImageIds.has(row.id));
  if (newImages.length > 0) statements.push(db.insert(productImages).values(newImages));

  // Documents: same approach.
  const keptDocumentList = [...keptDocumentIds];
  statements.push(
    keptDocumentList.length > 0
      ? db
          .delete(productDocuments)
          .where(and(eq(productDocuments.productId, id), notInArray(productDocuments.id, keptDocumentList)))
      : db.delete(productDocuments).where(eq(productDocuments.productId, id)),
  );
  const documentData = documentRows(id, documents);
  for (const row of documentData) {
    if (oldDocumentIds.has(row.id)) {
      statements.push(db.update(productDocuments).set({ title: row.title }).where(eq(productDocuments.id, row.id)));
    }
  }
  const newDocuments = documentData.filter((row) => !oldDocumentIds.has(row.id));
  if (newDocuments.length > 0) statements.push(db.insert(productDocuments).values(newDocuments));

  await db.batch(statements as Batch);
  return { slug: existing.slug, removedPublicIds };
}

export type DeleteResult = { slug: string; publicIds: string[] };

export async function deleteProduct(id: string): Promise<DeleteResult | null> {
  const db = getDb();
  const [existing] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
  if (!existing) return null;

  const [images, documents] = await Promise.all([
    db
      .select({ publicId: productImages.cloudinaryPublicId })
      .from(productImages)
      .where(eq(productImages.productId, id)),
    db
      .select({ publicId: productDocuments.cloudinaryPublicId })
      .from(productDocuments)
      .where(eq(productDocuments.productId, id)),
  ]);

  // Specs, images and documents are removed by the database (ON DELETE CASCADE).
  await db.delete(products).where(eq(products.id, id));
  return { slug: existing.slug, publicIds: [...images, ...documents].map((row) => row.publicId) };
}
