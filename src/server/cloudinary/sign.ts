import "server-only";
import { requiredEnv } from "../env";
import { getCloudinary } from "./client";

export type UploadKind = "image" | "document";

const SETTINGS: Record<UploadKind, { folder: string; allowedFormats: string }> = {
  image: { folder: "products/images", allowedFormats: "jpg,jpeg,png,webp,avif" },
  document: { folder: "products/documents", allowedFormats: "pdf" },
};

export type SignedUpload = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
};

// Creates the signature the browser needs to upload straight to Cloudinary.
// The API secret stays on the server; only the finished signature is returned.
export function createSignedUpload(kind: UploadKind): SignedUpload {
  const { folder, allowedFormats } = SETTINGS[kind];
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = getCloudinary().utils.api_sign_request(
    { allowed_formats: allowedFormats, folder, timestamp },
    requiredEnv("CLOUDINARY_API_SECRET"),
  );
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${requiredEnv("CLOUDINARY_CLOUD_NAME")}/image/upload`,
    apiKey: requiredEnv("CLOUDINARY_API_KEY"),
    timestamp,
    signature,
    folder,
    allowedFormats,
  };
}
