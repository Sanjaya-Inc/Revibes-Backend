import { Currency } from "../constant/currency";
import ExchangeTransactionItem from "./ExchangeTransactionItem";
import BaseModel from "./BaseModel";
import Voucher from "./Voucher";

export type TExchangeTransactionData = Partial<ExchangeTransaction>;

export enum PaymentMethod {
  // CREDIT_CARD = "CREDIT_CARD",
  // DEBIT_CARD = "DEBIT_CARD",
  // BANK_TRANSFER = "BANK_TRANSFER",
  // PAYPAL = "PAYPAL",
  // STRIPE = "STRIPE", // For platform payments
  // CASH = "CASH",
  // E_WALLET = "E_WALLET", // General for various e-wallets
  // GOPAY = "GOPAY", // Specific Indonesian e-wallet
  // OVO = "OVO", // Specific Indonesian e-wallet
  // DANA = "DANA", // Specific Indonesian e-wallet
  // LINKAJA = "LINKAJA", // Specific Indonesian e-wallet
  // QRIS = "QRIS", // Indonesian QR Code payment system
  // VIRTUAL_ACCOUNT = "VIRTUAL_ACCOUNT", // Common in Indonesia for bank transfers
  // CRYPTOCURRENCY = "CRYPTOCURRENCY",
  // APPLE_PAY = "APPLE_PAY",
  // GOOGLE_PAY = "GOOGLE_PAY",
  POINT = "point", // app's internal points system
  // OTHER = "OTHER", // For methods not explicitly listed
}

export enum ExchangeTransactionStatus {
  // Payment has been initiated but is awaiting confirmation from the payment gateway or bank.
  PENDING = "pending",

  // The payment attempt failed (e.g., insufficient funds, card declined, network error).
  FAILED = "failed",

  // Payment has been successfully captured and confirmed.
  PAID = "paid",

  // The payment has been partially refunded.
  PARTIALLY_REFUNDED = "partially-refunded",

  // The full payment has been refunded to the customer.
  REFUNDED = "refunded",
}

export type TExchangeItemPrice = {
  voucherId: string;
  amount: number;
  currency: Currency;
};

export const defaultExchangeTransactionData: TExchangeTransactionData = {
  id: "",
  maker: "",
  items: [],
  voucherCode: null,
  amount: 0,
  discount: 0,
  total: 0,
  paymentMethod: PaymentMethod.POINT,
  currency: Currency.REVIBE_POINT,
  status: ExchangeTransactionStatus.PENDING,
  createdAt: new Date(),

  voucherMetadata: null,
};

export class ExchangeTransaction extends BaseModel {
  id!: string;
  maker!: string;
  items!: ExchangeTransactionItem[];
  voucherCode?: string | null;
  amount!: number;
  discount!: number;
  total!: number;
  currency!: Currency;
  paymentMethod!: PaymentMethod;
  status!: ExchangeTransactionStatus;
  createdAt!: Date;

  voucherMetadata?: Partial<Voucher> | null;

  constructor(data: TExchangeTransactionData) {
    super(data, defaultExchangeTransactionData);
  }
}

export default ExchangeTransaction;
