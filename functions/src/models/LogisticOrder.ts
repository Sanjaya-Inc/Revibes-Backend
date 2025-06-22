import BaseModel from "./BaseModel";
import LogisticItem, { TLogisticItemData } from "./LogisticItem";

export type TLogisticOrderData = Partial<LogisticOrder>;

export const logisticOrderTypes = ["drop-off", "pick-up"] as const;

export type LogisticOrderType = (typeof logisticOrderTypes)[number];

export enum LogisticOrderStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const detailFields: (keyof LogisticOrder)[] = [
  "type",
  "createdAt",
  "updatedAt",
  "name",
  "country",
  "address",
  "postalCode",
  "storeLocation",
  "status",
  "maker",
  "items",
];

export class LogisticOrder extends BaseModel {
  id!: string;
  type!: LogisticOrderType;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  country!: string;
  address!: string;
  postalCode!: string;
  storeLocation!: number;
  status!: LogisticOrderStatus;
  maker!: string;
  items!: LogisticItem[];

  constructor(data: TLogisticOrderData) {
    super();

    Object.assign(this, { ...data });
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }

  assignItems(logisticItems: TLogisticItemData[]) {
    this.items = logisticItems.map(
      (item: TLogisticItemData) => new LogisticItem(item),
    );
  }
}

export default LogisticOrder;
