import BaseModel from "./BaseModel";

export type TLogisticOrderData = Partial<LogisticOrder>;

export const logisticOrderTypes = ["drop-off", "pick-up"] as const;

export type LogisticOrderType = (typeof logisticOrderTypes)[number];

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
  status!: string;
  maker!: string;

  constructor(data: TLogisticOrderData) {
    super();

    Object.assign(this, { ...data });
  }
}

export default LogisticOrder;
