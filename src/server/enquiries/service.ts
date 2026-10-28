import "server-only";
import { and, eq } from "drizzle-orm";
import type { EnquiryInput } from "@/lib/validation/enquiry";
import { getDb } from "../db";
import { enquiries, products } from "../db/schema";
import { sendEnquiryEmail } from "./email";

export async function createEnquiry(input: EnquiryInput): Promise<void> {
  const db = getDb();

  let productId: string | null = null;
  let productName: string | undefined;
  if (input.productSlug) {
    const [product] = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(and(eq(products.slug, input.productSlug), eq(products.status, "published")))
      .limit(1);
    if (product) {
      productId = product.id;
      productName = product.name;
    }
  }

  await db.insert(enquiries).values({
    name: input.name,
    email: input.email,
    company: input.company || null,
    productId,
    message: input.message,
  });

  await sendEnquiryEmail({
    name: input.name,
    email: input.email,
    company: input.company,
    message: input.message,
    productName,
  });
}
