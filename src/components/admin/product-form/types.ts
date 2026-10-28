import type { Category, Status } from "@/lib/categories";

export type UploadStatus = "uploading" | "done" | "error";

export type SpecRow = { key: string; label: string; value: string };

export type ImageItem = {
  key: string;
  id?: string;
  fileName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
  publicId?: string;
  url?: string;
  width?: number;
  height?: number;
  altText: string;
  isCover: boolean;
};

export type DocumentItem = {
  key: string;
  id?: string;
  fileName: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  publicId?: string;
  url?: string;
  title: string;
};

// Plain data passed from the server page into the form when editing.
export type ProductFormInitial = {
  id: string;
  name: string;
  category: Category;
  hsCode: string;
  description: string;
  status: Status;
  specs: { label: string; value: string }[];
  images: {
    id: string;
    publicId: string;
    url: string;
    width: number;
    height: number;
    altText: string;
    isCover: boolean;
  }[];
  documents: { id: string; publicId: string; url: string; title: string }[];
};
