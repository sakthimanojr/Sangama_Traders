// Adds two sample products (one fruit, one vegetable) so you can see the site working.
// Usage: npm run db:seed
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Category } from "../src/lib/categories";
import { productSpecs, products } from "../src/server/db/schema";

config({ path: ".env.local" });

type Sample = {
  slug: string;
  name: string;
  category: Category;
  hsCode: string;
  description: string;
  specs: { label: string; value: string }[];
};

const SAMPLES: Sample[] = [
  {
    slug: "sample-fresh-pomegranates",
    name: "Sample: Fresh Pomegranates",
    category: "fruits",
    hsCode: "0810.90",
    description:
      "This is a sample product created by the seed script. Open it in the admin area to add real photos, change the details, or delete it.",
    specs: [
      { label: "Variety", value: "Bhagwa (sample)" },
      { label: "Grade", value: "A grade (sample)" },
      { label: "Packaging", value: "4 kg cartons (sample)" },
    ],
  },
  {
    slug: "sample-small-onions",
    name: "Sample: Small Onions (Shallots)",
    category: "vegetables",
    hsCode: "0703.10",
    description:
      "This is a sample product created by the seed script. Open it in the admin area to add real photos, change the details, or delete it.",
    specs: [
      { label: "Size", value: "20 to 30 mm (sample)" },
      { label: "Origin", value: "Tamil Nadu, India (sample)" },
      { label: "Packaging", value: "10 kg mesh bags (sample)" },
    ],
  },
];

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing. Add it to .env.local first.");

  const db = drizzle({ client: neon(url) });

  for (const sample of SAMPLES) {
    const inserted = await db
      .insert(products)
      .values({
        slug: sample.slug,
        name: sample.name,
        category: sample.category,
        hsCode: sample.hsCode,
        description: sample.description,
        status: "published",
      })
      .onConflictDoNothing()
      .returning({ id: products.id });

    const created = inserted[0];
    if (!created) {
      console.log(`Already exists, skipped: ${sample.slug}`);
      continue;
    }

    await db.insert(productSpecs).values(
      sample.specs.map((spec, position) => ({ productId: created.id, label: spec.label, value: spec.value, position })),
    );
    console.log(`Sample product created: /products/${sample.slug}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
