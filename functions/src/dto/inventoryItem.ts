import { z } from "zod";
import { ImageSchema } from "./file";
import InventoryItem from "../models/InventoryItem";
import { TFirestoreData } from "./common";

// This schema represents the file object as parsed
export const AddInventoryItemSchema = z.object({
  name: z
    .string({
      required_error: "INVENTORY_ITEM.NAME_REQUIRED",
    })
    .min(3, "INVENTORY_ITEM.NAME_REQUIRED"),
  description: z.string().optional(),
  stock: z.number().optional(),
  isActive: z.boolean().default(true),
  image: ImageSchema.refine(
    (val) =>
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      Object.keys(val).length > 0,
    {
      message: "INVENTORY_ITEM.IMAGE_REQUIRED",
    },
  ),
});

export type TAddInventoryItem = z.infer<typeof AddInventoryItemSchema>;

export const GetInventoryItemSchema = z.object({
  id: z
    .string({
      required_error: "INVENTORY_ITEM.ID_REQUIRED",
    })
    .min(1, "INVENTORY_ITEM.ID_REQUIRED"),
});

export type TGetInventoryItem = z.infer<typeof GetInventoryItemSchema>;

export type TGetInventoryItemRes = TFirestoreData<InventoryItem>;

export const DeleteInventoryItemSchema = z.object({
  id: z
    .string({
      required_error: "INVENTORY_ITEM.ID_REQUIRED",
    })
    .min(1, "INVENTORY_ITEM.ID_REQUIRED"),
});

export type TDeleteInventoryItem = z.infer<typeof DeleteInventoryItemSchema>;
