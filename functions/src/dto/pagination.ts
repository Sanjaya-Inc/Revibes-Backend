import { z } from "zod";

export const paginationSortTypes = ["asc", "desc"] as const;
export type PaginationSortType = (typeof paginationSortTypes)[number];

export const paginationDirectionTypes = ["next", "prev"] as const;
export type PaginationDirectionType = (typeof paginationDirectionTypes)[number];

export const PaginationSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, "PAGINATION.LIMIT_MIN_1")
    .default(10)
    .optional(),
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z
    .enum(paginationSortTypes, {
      errorMap: () => ({ message: "PAGINATION.SORT_ORDER_INVALID" }),
    })
    .default("desc")
    .optional(),
  lastDocId: z.string().optional(),
  firstDocId: z.string().optional(),
  direction: z
    .enum(paginationDirectionTypes, {
      errorMap: () => ({ message: "PAGINATION.DIRECTION_INVALID" }),
    })
    .default("next")
    .optional(),
});

// Infer the TypeScript type from the schema for strong typing
export type TPagination = z.infer<typeof PaginationSchema>;
