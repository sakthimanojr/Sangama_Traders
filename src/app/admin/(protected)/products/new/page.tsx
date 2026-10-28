import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form/ProductForm";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">New product</h1>
      <ProductForm />
    </>
  );
}
