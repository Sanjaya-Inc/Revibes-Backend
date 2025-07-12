import { z } from "zod";
import { ImageSchema } from "./file";
import Voucher, { VoucherValueType } from "../models/Voucher";
import { TFirestoreData } from "./common";

// This schema represents the file object as parsed
export const CreateVoucherSchema = z.object({
  code: z
    .string({
      required_error: "VOUCHER.CODE_REQUIRED",
    })
    .min(3, "VOUCHER.CODE_REQUIRED"),
  name: z
    .string({
      required_error: "VOUCHER.NAME_REQUIRED",
    })
    .min(3, "VOUCHER.NAME_REQUIRED"),
  description: z.string().optional(),
  type: z.nativeEnum(VoucherValueType, {
    required_error: "VOUCHER.TYPE_REQUIRED",
  }),
  amount: z.number({
    required_error: "VOUCHER.CODE_REQUIRED",
  }),
  conditions: z
    .object({
      usageLimit: z.number().min(0, "VOUCHER.USAGE_LIMIT_MIN").optional(),
      minOrderItem: z.number().min(0, "VOUCHER.MIN_ORDER_ITEM_MIN").optional(),
      minOrderAmount: z
        .number()
        .min(0, "VOUCHER.MIN_ORDER_AMOUNT_MIN")
        .optional(),
      maxDiscountAmount: z
        .number()
        .min(0, "VOUCHER.MAX_DISCOUNT_AMOUNT_MIN")
        .optional(),
    })
    .optional(),
  claimPeriodStart: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date({
        required_error: "VOUCHER.CLAIM_PERIOD_START_REQUIRED",
        invalid_type_error: "VOUCHER.CLAIM_PERIOD_START_INVALID",
      }),
    )
    .optional(),
  claimPeriodEnd: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date
          ? new Date(arg)
          : undefined,
      z.date({
        required_error: "VOUCHER.CLAIM_PERIOD_END_REQUIRED",
        invalid_type_error: "VOUCHER.CLAIM_PERIOD_END_INVALID",
      }),
    )
    .optional(),
  image: ImageSchema.refine(
    (val) =>
      val !== undefined &&
      val !== null &&
      typeof val === "object" &&
      Object.keys(val).length > 0,
    {
      message: "VOUCHER.IMAGE_REQUIRED",
    },
  ).optional(),
});

export type TCreateVoucher = z.infer<typeof CreateVoucherSchema>;

export const GetVoucherSchema = z.object({
  id: z
    .string({
      required_error: "VOUCHER.ID_REQUIRED",
    })
    .min(1, "VOUCHER.ID_REQUIRED"),
});

export type TGetVoucher = z.infer<typeof GetVoucherSchema>;

export type TGetVoucherRes = TFirestoreData<Voucher>;

export const DeleteVoucherSchema = z.object({
  id: z
    .string({
      required_error: "VOUCHER.ID_REQUIRED",
    })
    .min(1, "VOUCHER.ID_REQUIRED"),
});

export type TDeleteVoucher = z.infer<typeof DeleteVoucherSchema>;
