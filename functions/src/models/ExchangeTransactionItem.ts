import BaseModel from "./BaseModel";
import { ExchangeItemType } from "./ExchangeItem";
import InventoryItem from "./InventoryItem";
import Voucher from "./Voucher";

export type TExchangeTransactionItemData = Partial<ExchangeTransactionItem>;

export const defaultExchangeTransactionItemData: TExchangeTransactionItemData =
  {
    id: "",
    type: ExchangeItemType.ITEM,
    exchangeTransactionId: "",
    sourceId: "",
    qty: 0,

    metadata: null,
  };

export class ExchangeTransactionItem extends BaseModel {
  id!: string;
  type!: ExchangeItemType;
  exchangeTransactionId!: string;
  sourceId!: string;
  qty!: number;

  metadata?: Partial<Voucher> | Partial<InventoryItem> | null;

  constructor(data: TExchangeTransactionItemData) {
    super(data, defaultExchangeTransactionItemData);
  }
}

export default ExchangeTransactionItem;
