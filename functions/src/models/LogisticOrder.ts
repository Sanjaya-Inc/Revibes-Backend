import { FileStorage } from "../utils/firebase";
import BaseModel from "./BaseModel";
import LogisticItem from "./LogisticItem";
import { LogisticOrderHistory } from "./LogisticOrderHistory";
import StoreBranch from "./StoreBranch";

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
  "totalPoint",
  "store",
];

export const detailFields: (keyof LogisticOrder)[] = [
  "id",
  "type",
  "createdAt",
  "updatedAt",
  "name",
  "country",
  "address",
  "addressDetail",
  "postalCode",
  "storeLocation",
  "status",
  "maker",
  "totalPoint",
  "items",
  "histories",
  "store",
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
  totalPoint: 0,

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
  totalPoint!: number;
  histories!: LogisticOrderHistory[];

  // relation
  store?: StoreBranch;

  constructor(data: TLogisticOrderData) {
    super(data, defaultLogisticOrderData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }

  async retrieveFullUrl(storage: FileStorage) {
    await Promise.all(
      this.items.map(async (i) => await i.retrieveFullUrl(storage)),
    );
  }
}

export default LogisticOrder;
