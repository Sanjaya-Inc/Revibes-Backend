import BaseModel from "./BaseModel";

export type TExchangeItemData = Partial<ExchangeItem>;

export enum ExchangeItemType {
  VOUCHER = "voucher",
  ITEM = "item",
}

export const defaultExchangeItemData: TExchangeItemData = {
  id: "",
  type: ExchangeItemType.ITEM,
  code: "",
  relationId: "",
  description: "",
  price: 0,
  quota: 0,
  availableAt: null,
  endedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class ExchangeItem extends BaseModel {
  id!: string;
  type!: ExchangeItemType;
  code!: string;
  relationId!: string;
  description?: string;
  price!: number;
  quota!: number;
  availableAt!: Date | null;
  endedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TExchangeItemData) {
    super(data, defaultExchangeItemData);
  }
}

export default ExchangeItem;
