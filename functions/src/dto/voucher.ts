import { z } from "zod";
import { ImageSchema } from "./file";
import Voucher, { VoucherValueType } from "../models/Voucher";
import { TFirestoreData } from "./common";
import { dropUndefinedFromObject } from "../utils/zod";
import { Currency } from "../constant/currency";

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
  amount: z.preprocess(
    // Preprocess function for 'amount'
    (arg) => {
      if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
        return parseFloat(arg);
      }
      return arg; // Let Zod's .number() handle invalid types
    },
    z
      .number({
        required_error: "VOUCHER.AMOUNT_REQUIRED",
        invalid_type_error: "VOUCHER.AMOUNT_INVALID",
      })
      .min(0, "VOUCHER.AMOUNT_MIN_INVALID"), // Add a min constraint for amount if applicable
  ),
  currency: z
    .nativeEnum(Currency, {
      errorMap: () => ({ message: "VOUCHER.CURRENCY_INVALID" }),
    })
    .optional(),
  conditions: z
    .preprocess(
      (arg) => {
        // If the top-level 'conditions' field is undefined, null, or an empty string,
        // return undefined so the final .optional() can make the whole object optional.
        if (
          arg === undefined ||
          arg === null ||
          (typeof arg === "string" && arg.trim() === "")
        ) {
          return undefined;
        }
        // If it's a string that looks like an object, try parsing it
        if (
          typeof arg === "string" &&
          arg.startsWith("{") &&
          arg.endsWith("}")
        ) {
          try {
            return JSON.parse(arg);
          } catch (e) {
            return undefined; // If parsing fails, treat as undefined
          }
        }
        return arg; // Pass through if it's already an object or another valid type
      },
      // The inner object schema for conditions, which will be validated if 'conditions' is present
      z.object(
        {
          maxClaim: z.preprocess(
            (arg) => {
              if (
                arg === null ||
                (typeof arg === "string" && arg.trim().toLowerCase() === "null")
              ) {
                return undefined;
              }
              if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
                return parseFloat(arg);
              }
              return arg;
            },
            z
              .number({
                invalid_type_error: "VOUCHER.CONDITIONS.MAX_CLAIM_INVALID",
              })
              .min(1, "VOUCHER.CONDITIONS.MAX_CLAIM_MIN")
              .optional(), // Add min constraint
          ),

          maxUsage: z.preprocess(
            (arg) => {
              if (
                arg === null ||
                (typeof arg === "string" && arg.trim().toLowerCase() === "null")
              ) {
                return undefined;
              }
              if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
                return parseFloat(arg);
              }
              return arg;
            },
            z
              .number({
                invalid_type_error: "VOUCHER.CONDITIONS.MAX_USAGE_INVALID",
              })
              .min(1, "VOUCHER.CONDITIONS.MAX_USAGE_MIN")
              .optional(), // Add min constraint
          ),

          minOrderItem: z.preprocess(
            (arg) => {
              if (
                arg === null ||
                (typeof arg === "string" && arg.trim().toLowerCase() === "null")
              ) {
                return undefined;
              }
              if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
                return parseFloat(arg);
              }
              return arg;
            },
            z
              .number({
                invalid_type_error: "VOUCHER.CONDITIONS.MIN_ORDER_ITEM_INVALID",
              })
              .min(1, "VOUCHER.CONDITIONS.MIN_ORDER_ITEM_MIN")
              .optional(), // Add min constraint
          ),

          minOrderAmount: z.preprocess(
            (arg) => {
              if (
                arg === null ||
                (typeof arg === "string" && arg.trim().toLowerCase() === "null")
              ) {
                return undefined;
              }
              if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
                return parseFloat(arg);
              }
              return arg;
            },
            z
              .number({
                invalid_type_error:
                  "VOUCHER.CONDITIONS.MIN_ORDER_AMOUNT_INVALID",
              })
              .min(1, "VOUCHER.CONDITIONS.MIN_ORDER_AMOUNT_MIN")
              .optional(), // Add min constraint
          ),

          maxDiscountAmount: z.preprocess(
            (arg) => {
              if (
                arg === null ||
                (typeof arg === "string" && arg.trim().toLowerCase() === "null")
              ) {
                return undefined;
              }
              if (typeof arg === "string" && !isNaN(parseFloat(arg))) {
                return parseFloat(arg);
              }
              return arg;
            },
            z
              .number({
                invalid_type_error:
                  "VOUCHER.CONDITIONS.MAX_DISCOUNT_AMOUNT_INVALID",
              })
              .min(1, "VOUCHER.CONDITIONS.MAX_DISCOUNT_AMOUNT_MIN")
              .optional(), // Add min constraint
          ),
        },
        { required_error: "VOUCHER.INVALID_CONDITIONS_OBJECT" },
      ),
    )
    .nullable()
    .optional()
    .transform((arg) => dropUndefinedFromObject(arg)), // This .optional() makes the entire conditions object optional.
  claimPeriodStart: z.preprocess(
    (arg) => {
      // If string or Date, convert to Date.
      // If null or undefined, return now.
      if (typeof arg === "string" || arg instanceof Date) {
        const date = new Date(arg);
        // Check for "Invalid Date"
        return isNaN(date.getTime()) ? new Date() : date; // If invalid, default to now
      }
      return new Date(); // Default to current date/time if no input or invalid
    },
    z.date({
      invalid_type_error: "VOUCHER.CLAIM_PERIOD_START_INVALID",
    }),
  ), // No .optional() or .required_error here, as preprocess handles default
  claimPeriodEnd: z
    .preprocess(
      (arg) => {
        // If string or Date, convert to Date.
        // If null, undefined, or empty string, return null.
        if (typeof arg === "string" && arg.trim() === "") {
          return null; // Treat empty string as null
        }
        if (typeof arg === "string" || arg instanceof Date) {
          const date = new Date(arg);
          return isNaN(date.getTime()) ? null : date; // If invalid date, return null
        }
        return null; // Default to null if no input or unexpected type
      },
      z
        .date({
          invalid_type_error: "VOUCHER.CLAIM_PERIOD_END_INVALID",
        })
        .nullable(), // Ensure the final type is Date | null
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
