import { z } from "zod";
import LogisticOrder, { LogisticOrderType } from "../models/LogisticOrder";
import { LogisticItemSchema } from "./logisticItem";

const mainLogisticOrderSchema = {
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
  name: z
    .string({
      required_error: "LOGISTIC.ORDER_NAME_REQUIRED",
    })
    .min(3, "LOGISTIC.ORDER_NAME_MIN_3"),
  country: z
    .string({
      required_error: "LOGISTIC.ORDER_COUNTRY_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_COUNTRY_REQUIRED"),
  address: z
    .string({
      required_error: "LOGISTIC.ORDER_ADDRESS_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_ADDRESS_REQUIRED"),
  postalCode: z
    .string({
      required_error: "LOGISTIC.ORDER_POSTAL_CODE_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_POSTAL_CODE_REQUIRED"),
  items: z
    .array(
      LogisticItemSchema.extend({
        id: z
          .string({
            required_error: "LOGISTIC.ITEM_ID_REQUIRED",
          })
          .min(1, "LOGISTIC.ITEM_ID_REQUIRED"),
      }),
      {
        required_error: "LOGISTIC.ORDER_ITEMS_REQUIRED",
      },
    )
    .min(1, "LOGISTIC.ORDER_ITEMS_MIN_1"),
};

const DropOffSchema = z.object({
  type: z.literal(LogisticOrderType.DROP_OFF),
  storeLocation: z
    .string({
      required_error: "LOGISTIC.STORE_ID_REQUIRED",
    })
    .min(1, "LOGISTIC.STORE_ID_REQUIRED"),
  ...mainLogisticOrderSchema,
});

const PickUpSchema = z.object({
  type: z.literal(LogisticOrderType.PICK_UP),
  addressDetail: z.string(),
  ...mainLogisticOrderSchema,
});

export const LogisticOrderSchema = z.discriminatedUnion("type", [
  DropOffSchema,
  PickUpSchema,
]);

export type TSubmitLogisticOrder = z.infer<typeof LogisticOrderSchema>;

export const GetLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
});

export type TGetLogisticOrder = z.infer<typeof GetLogisticOrderSchema>;

export type TGetLogisticOrderRes = {
  logisticOrder: LogisticOrder;
  logisticOrderRef: FirebaseFirestore.DocumentReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >;
  logisticOrderSnapshot: FirebaseFirestore.DocumentSnapshot<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >;
};

export const DeleteLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
});

export type TDeleteLogisticOrder = z.infer<typeof DeleteLogisticOrderSchema>;
