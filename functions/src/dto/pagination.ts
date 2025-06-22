import { z } from "zod";

export const paginationSortTypes = ["asc", "desc"] as const;
export type PaginationSortType = (typeof paginationSortTypes)[number];

export const paginationDirectionTypes = ["next", "prev"] as const;
export type PaginationDirectionType = (typeof paginationDirectionTypes)[number];

export const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).default(10).optional(),
  sortBy: z.string().default("createdAt").optional(),
  sortOrder: z.enum(paginationSortTypes).default("asc").optional(),
  lastDocId: z.string().optional(),
  firstDocId: z.string().optional(),
  direction: z.enum(paginationDirectionTypes).default("next").optional(),
});

// Infer the TypeScript type from the schema for strong typing
export type TPagination = z.infer<typeof PaginationSchema>;
