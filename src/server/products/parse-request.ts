import "server-only";
import { NextResponse } from "next/server";
import { productInputSchema, type ProductInput } from "@/lib/validation/product";
import { toFieldErrors } from "@/lib/validation/errors";
import { validateAssetOwnership } from "../cloudinary/assets";

export type ParsedProduct = { data: ProductInput; response?: undefined } | { data?: undefined; response: NextResponse };

export async function parseProductRequest(req: Request): Promise<ParsedProduct> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { response: NextResponse.json({ error: "Invalid request body." }, { status: 400 }) };
  }

  const result = productInputSchema.safeParse(json);
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: "Please fix the highlighted fields.", errors: toFieldErrors(result.error.issues) },
        { status: 422 },
      ),
    };
  }

  const assetErrors = validateAssetOwnership(result.data);
  if (assetErrors) {
    return {
      response: NextResponse.json({ error: "Some files are not valid.", errors: assetErrors }, { status: 422 }),
    };
  }

  return { data: result.data };
}
