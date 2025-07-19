import { z } from "zod";
import { TFirestoreData } from "./common";
import ExchangeItem from "../models/ExchangeItem";
import { Currency } from "../constant/currency";
import ExchangeTransaction, {
  PaymentMethod,
} from "../models/ExchangeTransaction";
import UserVoucher from "../models/UserVoucher";
import Voucher from "../models/Voucher";
import ExchangeTransactionItem from "../models/ExchangeTransactionItem";

// This schema represents the file object as parsed
export const CreateExchangeTransactionSchema = z.object({
  items: z
    .array(
      z.object({
        id: z
          .string({
            required_error: "EXCHANGE.TRANSACTION_ITEM_ID_REQUIRED",
          })
          .min(1, "EXCHANGE.TRANSACTION_ITEM_ID_REQUIRED"),
        qty: z
          .number({
            required_error: "EXCHANGE.TRANSACTION_ITEM_QTY_REQUIRED",
          })
          .min(1, "EXCHANGE.TRANSACTION_ITEM_QTY_REQUIRED"),
      }),
    )
    .min(1, "EXCHANGE.TRANSACTION_ITEM_REQUIRED"),
  voucherCode: z.string().nullable().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    required_error: "EXCHANGE.TRANSACTION_INVALID_TYPE",
  }),
  currency: z.nativeEnum(Currency, {
    required_error: "EXCHANGE.TRANSACTION_INVALID_TYPE",
  }),
});

export type TCreateExchangeTransaction = z.infer<
  typeof CreateExchangeTransactionSchema
>;

export type TCheckTransactionRes = {
  timestamp: Date;
  amount: number;
  discount: number;
  total: number;
  userVoucher?: UserVoucher | null;
  voucher?: Voucher | null;
  requestItems: ExchangeTransactionItem[];
  items: ExchangeItem[];
};

export const GetExchangeTransactionSchema = z.object({
  id: z
    .string({
      required_error: "EXCHANGE.TRANSACTION_ID_REQUIRED",
    })
    .min(1, "EXCHANGE.TRANSACTION_ID_REQUIRED"),
});

export type TGetExchangeTransaction = z.infer<
  typeof GetExchangeTransactionSchema
>;

export type TGetExchangeTransactionRes = TFirestoreData<ExchangeTransaction>;

export const DeleteExchangeTransactionSchema = z.object({
  id: z
    .string({
      required_error: "EXCHANGE.TRANSACTION_ID_REQUIRED",
    })
    .min(1, "EXCHANGE.TRANSACTION_ID_REQUIRED"),
});

export type TDeleteExchangeTransaction = z.infer<
  typeof DeleteExchangeTransactionSchema
>;
