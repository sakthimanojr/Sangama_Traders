import { z } from "zod";
import { CATEGORIES, STATUSES } from "../categories";

export const specSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80, "Use at most 80 characters"),
  value: z.string().trim().min(1, "Value is required").max(200, "Use at most 200 characters"),
});

export const imageSchema = z.object({
  id: z.string().uuid().optional(),
  publicId: z.string().min(1).max(300),
  url: z.string().url().max(1000),
  width: z.number().int().positive().max(30000),
  height: z.number().int().positive().max(30000),
  altText: z.string().trim().min(1, "Alt text is required").max(200, "Use at most 200 characters"),
  isCover: z.boolean(),
});

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  publicId: z.string().min(1).max(300),
  url: z.string().url().max(1000),
  title: z.string().trim().min(1, "Title is required").max(160, "Use at most 160 characters"),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(160, "Use at most 160 characters"),
  category: z.enum(CATEGORIES),
  // Optional. Digits with optional dots, for example 0810.90 or 08109000.
  hsCode: z
    .string()
    .trim()
    .regex(/^(\d{4}(\.?\d{2}){0,3})?$/, "Use digits only, for example 0810.90 or 08109000"),
  description: z.string().trim().max(5000, "Use at most 5000 characters"),
  status: z.enum(STATUSES),
  specs: z.array(specSchema).max(30, "Add at most 30 spec rows"),
  images: z.array(imageSchema).max(12, "Add at most 12 images"),
  documents: z.array(documentSchema).max(10, "Add at most 10 documents"),
});

export type ProductInput = z.infer<typeof productInputSchema>;
