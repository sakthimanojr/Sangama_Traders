import type { Metadata } from "next";
import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CATEGORIES, categoryLabels, isCategory } from "@/lib/categories";
import { thumbUrl } from "@/lib/cloudinary-url";
import { formatDate } from "@/lib/format";
import { listAdminProducts } from "@/server/products/admin-queries";

export const metadata: Metadata = { title: "Products" };

type Props = { searchParams: Promise<{ q?: string; category?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, category } = await searchParams;
  const activeCategory = isCategory(category) ? category : undefined;
  const products = await listAdminProducts({ q, category: activeCategory });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          New product
        </Link>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="q" className="label">
            Search
          </label>
          <input id="q" name="q" defaultValue={q ?? ""} placeholder="Name, slug or HS code" className="input w-64" />
        </div>
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select id="category" name="category" defaultValue={activeCategory ?? ""} className="input w-52">
            <option value="">All categories</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        {q || activeCategory ? (
          <Link href="/admin" className="py-2.5 text-sm text-ink-600 hover:text-brand-600">
            Clear
          </Link>
        ) : null}
      </form>

      <div className="card mt-6 overflow-x-auto">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-ink-700">No products found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">HS code</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbUrl(product.cover.publicId, 96)}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-ink-100" />
                      )}
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-ink-950 hover:text-brand-600">
                        {product.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3">{categoryLabels[product.category]}</td>
                  <td className="px-4 py-3">{product.hsCode ?? "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatDate(product.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {product.status === "published" ? (
                        <Link href={`/products/${product.slug}`} target="_blank" className="btn btn-secondary btn-sm">
                          View
                        </Link>
                      ) : null}
                      <Link href={`/admin/products/${product.id}`} className="btn btn-secondary btn-sm">
                        Edit
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
