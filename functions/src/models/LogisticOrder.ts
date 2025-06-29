import BaseModel from "./BaseModel";
import LogisticItem, { TLogisticItemData } from "./LogisticItem";

export type TLogisticOrderData = Partial<LogisticOrder>;

export enum LogisticOrderType {
  DROP_OFF = "drop-off",
  PICK_UP = "pick-up",
}

export enum LogisticOrderStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export const publicFields: (keyof LogisticOrder)[] = [
  "id",
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

export const detailFields: (keyof LogisticOrder)[] = [
  "id",
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
  addressDetail?: string;
  postalCode!: string;
  storeLocation?: string;
  items!: LogisticItem[];
  status!: LogisticOrderStatus;
  maker!: string;

  constructor(data: TLogisticOrderData) {
    super();

    Object.assign(this, { ...data });
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
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
