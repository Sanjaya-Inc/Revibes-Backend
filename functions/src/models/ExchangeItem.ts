import { Currency } from "../constant/currency";
import BaseModel from "./BaseModel";

export type TExchangeItemData = Partial<ExchangeItem>;

export enum ExchangeItemType {
  VOUCHER = "voucher",
  ITEM = "item",
}

export type TExchangeItemPrice = {
  amount: number;
  currency: Currency;
};

export const publicFields: (keyof ExchangeItem)[] = [
  "id",
  "type",
  "sourceId",
  "prices",
  "quota",
  "availableAt",
  "endedAt",
  "isAvailable",
  "createdAt",
  "updatedAt",
];

export const detailFields: (keyof ExchangeItem)[] = [
  "id",
  "type",
  "sourceId",
  "description",
  "prices",
  "quota",
  "availableAt",
  "endedAt",
  "isAvailable",
  "createdAt",
  "updatedAt",
];

export const defaultExchangeItemData: TExchangeItemData = {
  id: "",
  type: ExchangeItemType.ITEM,
  sourceId: "",
  description: "",
  prices: [
    {
      amount: 0,
      currency: Currency.REVIBE_POINT,
    },
  ],
  quota: 0,
  availableAt: new Date(),
  endedAt: null,
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class ExchangeItem extends BaseModel {
  id!: string;
  type!: ExchangeItemType;
  sourceId!: string;
  description?: string;
  prices!: TExchangeItemPrice[];
  quota!: number;
  availableAt!: Date;
  endedAt!: Date | null;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TExchangeItemData) {
    super(data, defaultExchangeItemData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }

  isUnlimited(): boolean {
    return this.quota === -1;
  }

  hasRequestedStock(value: number): boolean {
    return this.isUnlimited() ? true : this.quota >= value;
  }

  decrease(value: number): number {
    if (!this.isUnlimited()) {
      this.quota -= value;
    }

    return this.quota;
  }
}

export default ExchangeItem;
