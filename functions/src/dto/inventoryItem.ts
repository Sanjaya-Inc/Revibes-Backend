import { z } from "zod";
import { ImageSchema } from "./file";
import InventoryItem from "../models/InventoryItem";
import { TFirestoreData } from "./common";

// This schema represents the file object as parsed
export const AddInventoryItemSchema = z.object({
  name: z
    .string({
      required_error: "INVENTORY.ITEM_NAME_REQUIRED",
    })
    .min(3, "INVENTORY.ITEM_NAME_REQUIRED"),
  description: z.string().optional(),
  stock: z.preprocess(
    (arg) => {
      // If arg is a string, attempt to parse it to a float.
      // If parsing fails (results in NaN), return undefined to allow default or optional behavior.
      if (typeof arg === "string") {
        const parsed = parseFloat(arg);
        return isNaN(parsed) ? undefined : parsed; // Return undefined if not a valid number
      }
      // For non-string arguments, return them directly for Zod to handle.
      return arg;
    },
    z.number().min(-1, "INVENTORY.ITEM_STOCK_INVALID").default(0),
  ).optional(),
  isAvailable: z.preprocess(
        // Preprocess function for 'amount'
        (arg) => {
          if (typeof arg === "string") {
            if (arg === "true") {
              return true;
            } else if (arg === "false") {
              return false;
            }
          }
          return arg;
        },
        z.boolean(),
      ).default(true).optional(),
  image: ImageSchema.refine(
    (val) =>
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      Object.keys(val).length > 0,
    {
      message: "INVENTORY.ITEM_IMAGE_REQUIRED",
    },
  ),
});

export type TAddInventoryItem = z.infer<typeof AddInventoryItemSchema>;

export const GetInventoryItemSchema = z.object({
  id: z
    .string({
      required_error: "INVENTORY.ITEM_ID_REQUIRED",
    })
    .min(1, "INVENTORY.ITEM_ID_REQUIRED"),
});

export type TGetInventoryItem = z.infer<typeof GetInventoryItemSchema>;

export type TGetInventoryItemRes = TFirestoreData<InventoryItem>;

export const DeleteInventoryItemSchema = z.object({
  id: z
    .string({
      required_error: "INVENTORY.ITEM_ID_REQUIRED",
    })
    .min(1, "INVENTORY.ITEM_ID_REQUIRED"),
});

export type TDeleteInventoryItem = z.infer<typeof DeleteInventoryItemSchema>;
