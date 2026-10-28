import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/server/auth/guard";
import { deleteCloudinaryAssets } from "@/server/cloudinary/assets";
import { deleteProduct, updateProduct } from "@/server/products/mutations";
import { parseProductRequest } from "@/server/products/parse-request";
import { revalidateCatalogue } from "@/server/products/revalidate";

type Context = { params: Promise<{ id: string }> };

const idSchema = z.string().uuid();

export async function PUT(req: Request, context: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const id = idSchema.safeParse((await context.params).id);
  if (!id.success) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const parsed = await parseProductRequest(req);
  if (parsed.response) return parsed.response;

  const result = await updateProduct(id.data, parsed.data);
  if (!result) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // Files the admin removed from the product are deleted from Cloudinary too.
  const failed = await deleteCloudinaryAssets(result.removedPublicIds);
  revalidateCatalogue(result.slug);
  return NextResponse.json({
    ok: true,
    slug: result.slug,
    warning: failed.length > 0 ? `${failed.length} removed file(s) could not be deleted from Cloudinary.` : undefined,
  });
}

export async function DELETE(_req: Request, context: Context) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const id = idSchema.safeParse((await context.params).id);
  if (!id.success) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const result = await deleteProduct(id.data);
  if (!result) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const failed = await deleteCloudinaryAssets(result.publicIds);
  revalidateCatalogue(result.slug);
  return NextResponse.json({
    ok: true,
    warning: failed.length > 0 ? `${failed.length} file(s) could not be deleted from Cloudinary.` : undefined,
  });
}
