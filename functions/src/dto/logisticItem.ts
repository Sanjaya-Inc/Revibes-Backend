import { z } from "zod";
import LogisticItem, { LogisticItemType } from "../models/LogisticItem";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from "../constant/file";
import { TGetLogisticOrderRes } from "./logisticOrder";
import { TFirestoreData } from "./common";

export const LogisticItemSchema = z.object({
  name: z
    .string({
      required_error: "ITEM.NAME_REQUIRED",
    })
    .min(3, "ITEM.NAME_MIN_3"),
  type: z.nativeEnum(LogisticItemType, {
    required_error: "ITEM.INVALID_TYPE",
  }),
  weight: z
    .number({
      required_error: "ITEM.WEIGHT_REQUIRED",
    })
    .min(1, "ITEM.WEIGHT_MIN_1"),
});

export const GetLogisticItemsSchema = z.object({
  logisticOrderId: z
    .string({
      required_error: "LOGISTIC_ORDER.ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ID_REQUIRED"),
});

export type TGetLogisticItems = z.infer<typeof GetLogisticItemsSchema>;

export const GetLogisticItemSchema = z.object({
  logisticOrderId: z
    .string({
      required_error: "LOGISTIC_ORDER.ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ID_REQUIRED"),
  logisticOrderItemId: z
    .string({
      required_error: "LOGISTIC_ORDER.ITEM_ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ITEM_ID_REQUIRED"),
});

export type TGetLogisticItem = z.infer<typeof GetLogisticItemSchema>;

export type TGetLogisticItemRes = TFirestoreData<LogisticItem> & {
  order?: Partial<TGetLogisticOrderRes>;
};

export const AddLogisticItemSchema = z.object({
  logisticOrderId: z
    .string({
      required_error: "LOGISTIC_ORDER.ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ID_REQUIRED"),
});

export type TAddLogisticItem = z.infer<typeof AddLogisticItemSchema>;

export const AddLogisticItemMediaSchema = z.object({
  logisticOrderId: z
    .string({
      required_error: "LOGISTIC_ORDER.ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ID_REQUIRED"),
  logisticOrderItemId: z
    .string({
      required_error: "LOGISTIC_ORDER.ITEM_ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ITEM_ID_REQUIRED"),
  contentType: z.enum([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES], {
    required_error: "MEDIA.CONTENT_TYPE_REQUIRED",
    invalid_type_error: "MEDIA.INVALID_CONTENT_TYPE",
  }),
});

export type TAddLogisticItemMedia = z.infer<typeof AddLogisticItemMediaSchema>;

export type TAddLogisticItemMediaRes = {
  uploadUrl: string;
  downloadUrl: string;
  expiredAt: number;
};

export const DeleteLogisticItemSchema = z.object({
  logisticOrderId: z
    .string({
      required_error: "LOGISTIC_ORDER.ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ID_REQUIRED"),
  logisticOrderItemId: z
    .string({
      required_error: "LOGISTIC_ORDER.ITEM_ID_REQUIRED",
    })
    .min(1, "LOGISTIC_ORDER.ITEM_ID_REQUIRED"),
});

export type TDeleteLogisticItem = z.infer<typeof DeleteLogisticItemSchema>;
