import BaseModel from "./BaseModel";
import LogisticItem, { TLogisticItemData } from "./LogisticItem";
import { LogisticOrderHistory } from "./LogisticOrderHistory";

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
  "histories",
];

export const defaultLogisticOrderData: TLogisticOrderData = {
  id: "",
  type: LogisticOrderType.DROP_OFF,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "",
  country: "",
  address: "",
  addressDetail: null,
  postalCode: "",
  storeLocation: null,
  items: [],
  status: LogisticOrderStatus.DRAFT,
  maker: "",

  histories: [],
};

export class LogisticOrder extends BaseModel {
  id!: string;
  type!: LogisticOrderType;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  country!: string;
  address!: string;
  addressDetail?: string | null;
  postalCode!: string;
  storeLocation?: string | null;
  items!: LogisticItem[];
  status!: LogisticOrderStatus;
  maker!: string;
  histories!: LogisticOrderHistory[];

  constructor(data: TLogisticOrderData) {
    super(data, defaultLogisticOrderData);
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
