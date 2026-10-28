import { z } from "zod";

export type UploadKind = "image" | "document";

export type UploadedFile = { publicId: string; url: string; width: number; height: number };

const MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const signSchema = z.object({
  uploadUrl: z.string().url(),
  apiKey: z.string(),
  timestamp: z.number(),
  signature: z.string(),
  folder: z.string(),
  allowedFormats: z.string(),
});

const resultSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  width: z.number(),
  height: z.number(),
});

const errorSchema = z.object({ error: z.object({ message: z.string() }) });

// Returns an error message, or null when the file is acceptable.
export function checkFile(file: File, kind: UploadKind): string | null {
  if (file.size > MAX_BYTES) return "File is larger than 10 MB.";
  if (kind === "image" && !IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or AVIF image.";
  if (kind === "document" && file.type !== "application/pdf") return "Only PDF files are allowed.";
  return null;
}

async function getSignature(kind: UploadKind) {
  const response = await fetch("/api/admin/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? "Your session expired. Sign in again." : "Could not start the upload.");
  }
  return signSchema.parse(await response.json());
}

// Uploads straight from the browser to Cloudinary. The file never touches our server.
export async function uploadToCloudinary(
  file: File,
  kind: UploadKind,
  onProgress: (percent: number) => void,
): Promise<UploadedFile> {
  const sign = await getSignature(kind);

  return new Promise<UploadedFile>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sign.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.onload = () => {
      let payload: unknown;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Unexpected response from Cloudinary."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        const parsed = resultSchema.safeParse(payload);
        if (!parsed.success) {
          reject(new Error("Unexpected response from Cloudinary."));
          return;
        }
        resolve({
          publicId: parsed.data.public_id,
          url: parsed.data.secure_url,
          width: parsed.data.width,
          height: parsed.data.height,
        });
        return;
      }
      const failure = errorSchema.safeParse(payload);
      reject(new Error(failure.success ? failure.data.error.message : "Upload failed."));
    };

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sign.apiKey);
    body.append("timestamp", String(sign.timestamp));
    body.append("signature", sign.signature);
    body.append("folder", sign.folder);
    body.append("allowed_formats", sign.allowedFormats);
    xhr.send(body);
  });
}

export function altFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
