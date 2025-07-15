import { z } from "zod";
import LogisticOrder, {
  LogisticOrderStatus,
  LogisticOrderType,
} from "../models/LogisticOrder";
import { LogisticItemSchema } from "./logisticItem";
import { TFirestoreData } from "./common";
import { PaginationSchema } from "./pagination";

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
  address: z
    .string({
      required_error: "LOGISTIC.ORDER_ADDRESS_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_ADDRESS_REQUIRED"),
  addressDetail: z.string().optional(),
  postalCode: z
    .string({
      required_error: "LOGISTIC.ORDER_POSTAL_CODE_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_POSTAL_CODE_REQUIRED"),
  ...mainLogisticOrderSchema,
});

export const LogisticOrderSchema = z.discriminatedUnion("type", [
  DropOffSchema,
  PickUpSchema,
]);

export type TSubmitLogisticOrder = z.infer<typeof LogisticOrderSchema>;

export const RejectLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
  reason: z.string().optional(),
});

export type TRejectLogisticOrder = z.infer<typeof RejectLogisticOrderSchema>;

export const CompleteLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
  customTotalPoint: z.number().optional(),
  customPoints: z
    .array(
      z.object({
        id: z
          .string({
            required_error: "LOGISTIC.ITEM_ID_REQUIRED",
          })
          .min(1, "LOGISTIC.ITEM_ID_REQUIRED"),
        point: z
          .number({
            required_error: "LOGISTIC.ITEM_POINT_REQUIRED",
          })
          .min(1, "LOGISTIC.ITEM_POINT_REQUIRED"),
      }),
    )
    .optional(),
});

export type TCompleteLogisticOrder = z.infer<
  typeof CompleteLogisticOrderSchema
>;

export const EstimateLogisticOrderPointSchema = z.object({
  items: z
    .array(LogisticItemSchema, {
      required_error: "LOGISTIC.ORDER_ITEMS_REQUIRED",
    })
    .min(1, "LOGISTIC.ORDER_ITEMS_MIN_1"),
});

export type TEstimateLogisticOrderPoint = z.infer<
  typeof EstimateLogisticOrderPointSchema
>;

export type TEstimateLogisticOrderPointRes = {
  items: { [key: string]: number };
  total: number;
};

export const GetLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
});

export type TGetLogisticOrder = z.infer<typeof GetLogisticOrderSchema>;

export type TGetLogisticOrderRes = TFirestoreData<LogisticOrder>;

export const GetLogisticOrdersSchema = z.object({
  ...PaginationSchema.shape,
  statuses: z
    .preprocess(
      // Preprocess function for 'amount'
      (arg) => {
        if (typeof arg === "string") {
          return arg.split(",");
        }
        return arg; // Let Zod's .array() handle invalid types
      },
      z.array(z.nativeEnum(LogisticOrderStatus)).optional(),
    )
    .optional(),
});

export type TGetLogisticOrders = z.infer<typeof GetLogisticOrdersSchema>;

export const DeleteLogisticOrderSchema = z.object({
  id: z
    .string({
      required_error: "LOGISTIC.ID_REQUIRED",
    })
    .min(1, "LOGISTIC.ID_REQUIRED"),
});

export type TDeleteLogisticOrder = z.infer<typeof DeleteLogisticOrderSchema>;
