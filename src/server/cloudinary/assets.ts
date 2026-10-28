import "server-only";
import type { FieldErrors } from "@/lib/validation/errors";
import type { ProductInput } from "@/lib/validation/product";
import { requiredEnv } from "../env";
import { getCloudinary } from "./client";

const IMAGE_ID = /^products\/images\/[A-Za-z0-9_-]+$/;
const DOCUMENT_ID = /^products\/documents\/[A-Za-z0-9_-]+$/;

// Makes sure every file in a save request really lives in this site's Cloudinary folders,
// so a request cannot attach or later delete somebody else's files.
export function validateAssetOwnership(input: ProductInput): FieldErrors | null {
  const prefix = `https://res.cloudinary.com/${requiredEnv("CLOUDINARY_CLOUD_NAME")}/`;
  const errors: FieldErrors = {};

  input.images.forEach((image, index) => {
    if (!IMAGE_ID.test(image.publicId) || !image.url.startsWith(prefix)) {
      errors[`images.${index}.publicId`] = "This image was not uploaded through the admin area";
    }
  });
  input.documents.forEach((doc, index) => {
    if (!DOCUMENT_ID.test(doc.publicId) || !doc.url.startsWith(prefix)) {
      errors[`documents.${index}.publicId`] = "This document was not uploaded through the admin area";
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
}

// Deletes files from Cloudinary. Returns the IDs that could not be deleted.
export async function deleteCloudinaryAssets(publicIds: string[]): Promise<string[]> {
  const unique = [...new Set(publicIds)];
  if (unique.length === 0) return [];

  const cloudinary = getCloudinary();
  const failed: string[] = [];

  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    try {
      const result = await cloudinary.api.delete_resources(chunk, {
        resource_type: "image",
        type: "upload",
        invalidate: true,
      });
      const deleted = (result.deleted ?? {}) as Record<string, string>;
      for (const id of chunk) {
        const state = deleted[id];
        if (state !== "deleted" && state !== "not_found") failed.push(id);
      }
    } catch (error) {
      console.error("Cloudinary delete failed", error);
      failed.push(...chunk);
    }
  }

  return failed;
}
