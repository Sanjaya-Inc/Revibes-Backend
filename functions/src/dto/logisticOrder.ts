import { z } from "zod";
import LogisticOrder, { logisticOrderTypes } from "../models/LogisticOrder";
import { LogisticItemSchema } from "./logisticItem";

export const LogisticOrderTypeEnum = z.enum(logisticOrderTypes);

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
  date: z.coerce.date(),
  items: z
    .array(LogisticItemSchema, {
      required_error: "LOGISTIC.ORDER_ITEMS_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_ITEMS_MIN_1"),
};

const DropOffSchema = z.object({
  type: z.literal(logisticOrderTypes[0]),
  storeLocation: z.number(),
  ...mainLogisticOrderSchema,
});

const PickUpSchema = z.object({
  type: z.literal("pick-up"),
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
