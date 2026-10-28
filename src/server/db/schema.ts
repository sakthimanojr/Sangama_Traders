import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
// Relative import on purpose: drizzle-kit reads this file without the "@/" alias.
import { CATEGORIES, STATUSES } from "../../lib/categories";

export const categoryEnum = pgEnum("product_category", CATEGORIES);
export const statusEnum = pgEnum("product_status", STATUSES);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: categoryEnum("category").notNull(),
    hsCode: text("hs_code"),
    description: text("description").notNull().default(""),
    status: statusEnum("status").notNull().default("draft"),
    // Points at product_images.id. Not a foreign key, to avoid a circular reference.
    // The app keeps it consistent when saving.
    coverImageId: uuid("cover_image_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.category),
    index("products_status_idx").on(t.status),
    index("products_created_at_idx").on(t.createdAt),
    index("products_status_category_sort_idx").on(t.status, t.category, t.sortOrder),
  ],
);

export const productSpecs = pgTable(
  "product_specs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("product_specs_product_idx").on(t.productId, t.position)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    url: text("url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    altText: text("alt_text").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId, t.position)],
);

export const productDocuments = pgTable(
  "product_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
  },
  (t) => [index("product_documents_product_idx").on(t.productId)],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    // Enquiries are kept even if the product is deleted later.
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_at_idx").on(t.createdAt)],
);

// Supporting table for rate limiting login and enquiry requests. Works across serverless instances.
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: integer("count").notNull().default(0),
});
