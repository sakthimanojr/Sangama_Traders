import { NextResponse } from "next/server";
import { requireAdminApi } from "@/server/auth/guard";
import { createProduct } from "@/server/products/mutations";
import { parseProductRequest } from "@/server/products/parse-request";
import { revalidateCatalogue } from "@/server/products/revalidate";

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const parsed = await parseProductRequest(req);
  if (parsed.response) return parsed.response;

  const { id, slug } = await createProduct(parsed.data);
  revalidateCatalogue(slug);
  return NextResponse.json({ id, slug }, { status: 201 });
}
