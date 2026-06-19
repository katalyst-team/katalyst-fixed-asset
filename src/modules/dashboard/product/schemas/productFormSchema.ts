import { z } from "zod";

/**
 * Schema for product form validation
 */
export const productFormSchema = z.object({
  categoryId: z.string().optional(),
  internal_code: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  storeId: z.string().min(1, { message: "Store is required" }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
