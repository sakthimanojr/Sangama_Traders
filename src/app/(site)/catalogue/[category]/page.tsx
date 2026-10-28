import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogueView } from "@/components/public/CatalogueView";
import { CtaBand } from "@/components/public/CtaBand";
import { PageIntro } from "@/components/public/PageIntro";
import { CATEGORIES, categoryBlurbs, categoryLabels, isCategory } from "@/lib/categories";
import { listPublishedProducts } from "@/server/products/queries";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  return {
    title: categoryLabels[category],
    description: categoryBlurbs[category],
    alternates: { canonical: `/catalogue/${category}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const products = await listPublishedProducts({ category });
  return (
    <>
      <PageIntro title={categoryLabels[category]}>{categoryBlurbs[category]}</PageIntro>
      <CatalogueView products={products} active={category} />
      <CtaBand />
    </>
  );
}
