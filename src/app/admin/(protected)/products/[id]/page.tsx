import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProductForm } from "@/components/admin/product-form/ProductForm";
import type { ProductFormInitial } from "@/components/admin/product-form/types";
import { getProductForEdit } from "@/server/products/admin-queries";

export const metadata: Metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) notFound();

  const product = await getProductForEdit(id.data);
  if (!product) notFound();

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    category: product.category,
    hsCode: product.hsCode ?? "",
    description: product.description,
    status: product.status,
    specs: product.specs.map(({ label, value }) => ({ label, value })),
    images: product.images.map((image) => ({
      id: image.id,
      publicId: image.publicId,
      url: image.url,
      width: image.width,
      height: image.height,
      altText: image.altText,
      isCover: image.id === product.coverImageId,
    })),
    documents: product.documents.map(({ id: docId, publicId, url, title }) => ({ id: docId, publicId, url, title })),
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Edit product</h1>
          <StatusBadge status={product.status} />
        </div>
        <div className="flex items-center gap-2">
          {product.status === "published" ? (
            <Link href={`/products/${product.slug}`} target="_blank" className="btn btn-secondary btn-sm">
              View on site
            </Link>
          ) : null}
          <DeleteProductButton productId={product.id} productName={product.name} redirectTo="/admin" />
        </div>
      </div>
      <ProductForm initial={initial} />
    </>
  );
}
