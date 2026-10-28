import type { Category, Status } from "@/lib/categories";

export type CoverImage = { publicId: string; altText: string; width: number; height: number };

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  hsCode: string | null;
  description: string;
  cover: CoverImage | null;
};

export type ProductImageData = {
  id: string;
  publicId: string;
  url: string;
  width: number;
  height: number;
  altText: string;
};

export type ProductDocumentData = { id: string; publicId: string; url: string; title: string };

export type ProductDetailData = ProductCardData & {
  status: Status;
  specs: { id: string; label: string; value: string }[];
  images: ProductImageData[];
  documents: ProductDocumentData[];
  coverImageId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
