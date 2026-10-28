import Link from "next/link";
import { CATEGORIES, categoryLabels, type Category } from "@/lib/categories";
import type { ProductCardData } from "@/server/products/types";
import { ProductCard } from "./ProductCard";

// Category filter built from plain links, so the catalogue stays static and ships no JavaScript.
export function CatalogueView({ products, active }: { products: ProductCardData[]; active: Category | null }) {
  const tabs: { href: string; label: string; key: Category | null }[] = [
    { href: "/catalogue", label: "All", key: null },
    ...CATEGORIES.map((category) => ({
      href: `/catalogue/${category}`,
      label: categoryLabels[category],
      key: category,
    })),
  ];

  return (
    <section className="container-page py-10">
      <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                isActive
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-white text-ink-800 hover:bg-ink-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {products.length === 0 ? (
        <p className="mt-10 text-ink-700">No products here yet. Please check back soon or send us an enquiry.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 3} />
          ))}
        </div>
      )}
    </section>
  );
}
