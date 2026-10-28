import Link from "next/link";
import { categoryLabels } from "@/lib/categories";
import type { ProductCardData } from "@/server/products/types";
import { CloudImage } from "./CloudImage";

const CARD_SIZES = "(min-width: 1024px) 352px, (min-width: 640px) 45vw, 92vw";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-ink-50">
        {product.cover ? (
          <CloudImage
            publicId={product.cover.publicId}
            alt={product.cover.altText}
            fill
            sizes={CARD_SIZES}
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">No photo yet</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {categoryLabels[product.category]}
        </p>
        <h3 className="mt-1 text-base font-semibold text-ink-950">{product.name}</h3>
        {product.hsCode ? <p className="mt-1 text-xs text-ink-600">HS code {product.hsCode}</p> : null}
        {product.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-ink-700">{product.description}</p>
        ) : null}
      </div>
    </Link>
  );
}
