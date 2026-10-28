import Image, { type ImageProps } from "next/image";
import { getBlurDataUrl } from "@/server/images/blur";

type CloudImageProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL"> & { publicId: string };

// Server component: the blur placeholder is created while the page is generated,
// so it is part of the HTML. Cloudinary serves the resized image (f_auto, q_auto).
export async function CloudImage({ publicId, alt, ...rest }: CloudImageProps) {
  const blurDataURL = await getBlurDataUrl(publicId);
  return <Image src={publicId} alt={alt} placeholder="blur" blurDataURL={blurDataURL} {...rest} />;
}
