import type { Metadata } from "next";
import { CatalogueView } from "@/components/public/CatalogueView";
import { CtaBand } from "@/components/public/CtaBand";
import { PageIntro } from "@/components/public/PageIntro";
import { site } from "@/config/site";
import { listPublishedProducts } from "@/server/products/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Catalogue",
  description: `Browse the full product catalogue of ${site.name}: fresh fruits and vegetables sourced directly from growers.`,
  alternates: { canonical: "/catalogue" },
};

export default async function CataloguePage() {
  const products = await listPublishedProducts();
  return (
    <>
      <PageIntro title="Catalogue">Fresh fruits and vegetables, sourced directly from growers.</PageIntro>
      <CatalogueView products={products} active={null} />
      <CtaBand />
    </>
  );
}
