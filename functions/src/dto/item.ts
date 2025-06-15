import { z } from "zod";
import { ImageSchema, VideoSchema } from "./file";
import { logisticItemTypes } from "../models/LogisticItem";

const MAX_TOTAL_FILES = 3;

// A union schema to allow either an image OR a video
// IMPORTANT: Zod's union tries schemas in order. Put more specific/strict ones first if there's overlap.
// Here, the mimetype refinement helps distinguish them clearly.
export const ItemFileSchema = z.union([ImageSchema, VideoSchema], {
  message: "ITEM.INVALID_TYPE",
});

export const ItemSchema = z.object({
  name: z.string().min(3, "ITEM.NAME_MIN_3"),
  type: z.enum(logisticItemTypes),
  weight: z.number().min(1, "ITEM.WEIGHT_MIN_1"),
  files: z.array(ItemFileSchema).max(MAX_TOTAL_FILES, "ITEM.COUNT_MAX_3"), // Maximum number of files
});
