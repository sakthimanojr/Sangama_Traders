import "server-only";
import { revalidatePath } from "next/cache";

// Called after every create, edit or delete so public pages update immediately.
export function revalidateCatalogue(slug?: string): void {
  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/catalogue/[category]", "page");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/products/${slug}`);
}
