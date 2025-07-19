import { z } from "zod";
import { TFirestoreData } from "./common";
import ExchangeItem, { ExchangeItemType } from "../models/ExchangeItem";
import { Currency } from "../constant/currency";

// This schema represents the file object as parsed
export const AddExchangeItemSchema = z.object({
  type: z.nativeEnum(ExchangeItemType, {
    required_error: "EXCHANGE.ITEM_INVALID_TYPE",
  }),
  sourceId: z.string({
    required_error: "EXCHANGE.ITEM_SOURCE_ID_REQUIRED",
  }),
  description: z.string({
    required_error: "EXCHANGE.ITEM_DESCRIPTION_REQUIRED",
  }),
  prices: z
    .array(
      z.object({
        amount: z.number({
          required_error: "EXCHANGE.ITEM_PRICE_AMOUNT_REQUIRED",
        }),
        currency: z.nativeEnum(Currency, {
          required_error: "EXCHANGE.ITEM_PRICE_CURRENCY_REQUIRED",
        }),
      }),
    )
    .min(1, "EXCHANGE.ITEM_PRICE_REQUIRED"),
  quota: z
    .preprocess((arg) => {
      // If arg is a string, attempt to parse it to a float.
      // If parsing fails (results in NaN), return undefined to allow default or optional behavior.
      if (typeof arg === "string") {
        const parsed = parseFloat(arg);
        return isNaN(parsed) ? undefined : parsed; // Return undefined if not a valid number
      }
      // For non-string arguments, return them directly for Zod to handle.
      return arg;
    }, z.number().min(-1, "EXCHANGE.ITEM_QUOTA_INVALID").default(0))
    .optional(),
  availableAt: z.preprocess(
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
      invalid_type_error: "EXCHANGE.ITEM_AVAILABLE_AT_INVALID",
    }),
  ), // No .optional() or .required_error here, as preprocess handles default
  endedAt: z
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
          invalid_type_error: "EXCHANGE.ITEM_ENDED_AT_INVALID",
        })
        .nullable(), // Ensure the final type is Date | null
    )
    .optional(),
  isAvailable: z
    .preprocess(
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
    )
    .default(true)
    .optional(),
});

export type TAddExchangeItem = z.infer<typeof AddExchangeItemSchema>;

export const GetExchangeItemSchema = z.object({
  id: z
    .string({
      required_error: "EXCHANGE.ITEM_ID_REQUIRED",
    })
    .min(1, "EXCHANGE.ITEM_ID_REQUIRED"),
});

export type TGetExchangeItem = z.infer<typeof GetExchangeItemSchema>;

export type TGetExchangeItemRes = TFirestoreData<ExchangeItem>;

export const DeleteExchangeItemSchema = z.object({
  id: z
    .string({
      required_error: "EXCHANGE.ITEM_ID_REQUIRED",
    })
    .min(1, "EXCHANGE.ITEM_ID_REQUIRED"),
});

export type TDeleteExchangeItem = z.infer<typeof DeleteExchangeItemSchema>;
