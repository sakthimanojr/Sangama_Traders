import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120, "Use at most 120 characters"),
  email: z.string().trim().email("Enter a valid email address").max(200, "Use at most 200 characters"),
  company: z.string().trim().max(160, "Use at most 160 characters").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(4000, "Use at most 4000 characters"),
  productSlug: z.string().trim().max(200).optional(),
  // Honeypot. Real visitors never see or fill this field.
  website: z.string().max(500).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
