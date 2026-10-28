// Used by next/image (see next.config.ts). `src` is a Cloudinary public ID,
// for example "products/images/abc123". Cloudinary resizes and picks the best format.
export default function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_limit,w_${width}/${src}`;
}
