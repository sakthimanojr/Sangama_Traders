import "server-only";

// A tiny grey-blue placeholder, used if Cloudinary cannot be reached.
const FALLBACK =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6"><rect width="8" height="6" fill="#dde7f5"/></svg>',
  ).toString("base64");

const cache = new Map<string, string>();

// Fetches a ~20px blurred copy of the image from Cloudinary and inlines it as a data URL.
// This runs while the page is generated, so visitors get the blur in the HTML with no extra request.
export async function getBlurDataUrl(publicId: string): Promise<string> {
  const cached = cache.get(publicId);
  if (cached) return cached;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return FALLBACK;

  try {
    const response = await fetch(
      `https://res.cloudinary.com/${cloud}/image/upload/w_20,e_blur:200,q_40,f_jpg/${publicId}`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!response.ok) return FALLBACK;
    const bytes = Buffer.from(await response.arrayBuffer());
    const dataUrl = `data:image/jpeg;base64,${bytes.toString("base64")}`;
    cache.set(publicId, dataUrl);
    return dataUrl;
  } catch {
    return FALLBACK;
  }
}
