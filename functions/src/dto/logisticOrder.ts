import { z } from "zod";
import { logisticOrderTypes } from "../models/LogisticOrder";
import { ItemSchema } from "./item";

export const LogisticOrderTypeEnum = z.enum(logisticOrderTypes);

const mainLogisticOrderSchema = {
  name: z.string().min(3, "LOGISTIC.ORDER_NAME_MIN_3"),
  country: z.string().min(1, "LOGISTIC.ORDER_COUNTRY_REQUIRED"),
  address: z.string().min(1, "LOGISTIC.ORDER_ADDRESS_REQUIRED"),
  postalCode: z.string().min(1, "LOGISTIC.ORDER_POSTAL_CODE_REQUIRED"),
  date: z.coerce.date(),
  items: z.array(ItemSchema),
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

export const CreateLogisticOrderSchema = z.discriminatedUnion("type", [
  DropOffSchema,
  PickUpSchema,
]);

// Type inference (optional)
export type TCreateLogisticOrder = z.infer<typeof CreateLogisticOrderSchema>;

export type TCreateLogisticOrderRes = {
  id: string;
};
