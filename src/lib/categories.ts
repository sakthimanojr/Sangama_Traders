// The ONLY place that lists product categories.
// To add a category later (for example machinery):
//   1. add its key to CATEGORIES and its text to categoryLabels / categoryBlurbs below
//   2. run `npm run db:generate` and then `npm run db:migrate`
// Everything else (admin form, catalogue filter, routes, sitemap) reads from this file.
export const CATEGORIES = ["fruits", "vegetables"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["draft", "published"] as const;
export type Status = (typeof STATUSES)[number];

export const categoryLabels: Record<Category, string> = {
  fruits: "Fruits",
  vegetables: "Vegetables",
};

export const categoryBlurbs: Record<Category, string> = {
  fruits: "Fresh fruits sourced directly from growers, quality-checked, graded and packed to stay fresh.",
  vegetables: "Farm-fresh vegetables sourced directly from growers, quality-checked and packed for reliable supply.",
};

export function isCategory(value: string | undefined | null): value is Category {
  return CATEGORIES.some((c) => c === value);
}
