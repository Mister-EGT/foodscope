import { z } from "zod";

export const rawProductSchema = z.record(z.string(), z.unknown());

export const productResponseSchema = z
  .object({
    code: z.union([z.string(), z.number()]).optional(),
    status: z.union([z.number(), z.string()]).optional(),
    status_verbose: z.string().optional(),
    result: z.record(z.string(), z.unknown()).optional(),
    product: rawProductSchema.optional(),
    errors: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const searchResponseSchema = z
  .object({
    products: z.array(rawProductSchema).optional(),
    hits: z.unknown().optional(),
    count: z.number().optional(),
    page: z.number().optional(),
    page_count: z.number().optional(),
    page_size: z.number().optional(),
    total: z.unknown().optional(),
  })
  .passthrough();

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
