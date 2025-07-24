import { Currency } from "../constant/currency";
import BaseModel from "./BaseModel";

export type TVoucherData = Partial<Voucher>;

export enum VoucherValueType {
  PERCENT_OFF = "percent-off",
  FIXED_AMOUNT = "fixed-amount",
}

export type TVoucherValue = {
  type: VoucherValueType;
  amount: number;
  currency?: Currency;
};

export type TVoucherCondition = {
  maxClaim: number; // max voucher claim that user can have
  maxUsage: number; // max number of transaction that user can use this voucher
  minOrderItem: number; // minimum item in a single transaction that can use this voucher
  minOrderAmount: number; // minimum total amount in a single transaction that can use this voucher
  maxDiscountAmount: number; // max discount amount in a single transaction that can apply when use this voucher
};

export const metadataFields: (keyof Voucher)[] = [
  "id",
  "code",
  "name",
  "description",
  "value",
  "conditions",
  "imageUri",
];

export const publicFields: (keyof Voucher)[] = [
  "id",
  "code",
  "name",
  "value",
  "imageUri",
  "claimPeriodStart",
  "claimPeriodEnd",
  "createdAt",
  "updatedAt",
];

export const detailFields: (keyof Voucher)[] = [
  "id",
  "code",
  "name",
  "description",
  "value",
  "conditions",
  "imageUri",
  "termConditions",
  "claimPeriodStart",
  "claimPeriodEnd",
  "createdAt",
  "updatedAt",
];

export const defaultVoucherData: TVoucherData = {
  id: "",
  code: "",
  name: "",
  description: "",
  value: {
    amount: 0,
    type: VoucherValueType.FIXED_AMOUNT,
  },
  conditions: null,
  imageUri: "",
  termConditions: [],

  claimPeriodStart: new Date(),
  claimPeriodEnd: null,
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  inUse: false,
};

export class Voucher extends BaseModel {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  value!: TVoucherValue;
  conditions?: Partial<TVoucherCondition> | null;
  imageUri?: string;
  termConditions?: string[];

  claimPeriodStart!: Date;
  claimPeriodEnd?: Date | null;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  inUse!: boolean;

  constructor(data: TVoucherData) {
    super(data, defaultVoucherData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }

  getMetadataFields(keys = metadataFields) {
    return super.pickFields(keys);
  }

  isClaimBetweenPeriod(startDate: Date, endDate?: Date | null): boolean {
    if (startDate < this.claimPeriodStart) {
      return false;
    }

    if (this.claimPeriodEnd && endDate) {
      if (endDate > this.claimPeriodEnd) {
        return false;
      }
    }

    return true;
  }

  calculateDiscount(trxAmount: number) {
    const { amount, type } = this.value;
    let discount = 0;
    if (type === VoucherValueType.PERCENT_OFF) {
      const percentage = amount / 100;
      discount = trxAmount * percentage;
    } else if (type === VoucherValueType.FIXED_AMOUNT) {
      discount = amount;
    }

    if (
      this.conditions?.maxDiscountAmount &&
      discount > this.conditions?.maxDiscountAmount
    ) {
      discount = this.conditions.maxDiscountAmount;
    }

    return discount;
  }
}

export default Voucher;
