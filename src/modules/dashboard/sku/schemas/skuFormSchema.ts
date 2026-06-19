import { z } from "zod";

/**
 * Schema for SKU form validation
 */
export const skuFormSchema = z.object({
  categoryId: z.string().optional(),
  internal_code: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  storeId: z.string().min(1, { message: "Store is required" }),
});

export type SkuFormValues = z.infer<typeof skuFormSchema>;
