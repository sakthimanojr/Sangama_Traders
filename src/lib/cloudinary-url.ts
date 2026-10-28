// Plain URL builders for places that do not use next/image (admin thumbnails, Open Graph images).
function base(): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  return `https://res.cloudinary.com/${cloud}/image/upload`;
}

export function thumbUrl(publicId: string, size = 160): string {
  return `${base()}/c_fill,w_${size},h_${size},f_auto,q_auto/${publicId}`;
}

export function ogImageUrl(publicId: string): string {
  return `${base()}/c_fill,w_1200,h_630,f_jpg,q_auto/${publicId}`;
}

export function fullImageUrl(publicId: string): string {
  return `${base()}/f_auto,q_auto,c_limit,w_2000/${publicId}`;
}
