import BaseModel from "./BaseModel";
import { LogisticOrderStatus } from "./LogisticOrder";

export type TLogisticOrderHistoryData = Partial<LogisticOrderHistory>;

export const defaultLogisticOrderHistoryData: TLogisticOrderHistoryData = {
  id: "",
  timestamp: new Date(),
  status: LogisticOrderStatus.SUBMITTED,
  meta: null,
};

export class LogisticOrderHistory extends BaseModel {
  id!: string;
  timestamp!: Date;
  status!: LogisticOrderStatus;
  meta?: any;

  constructor(data: TLogisticOrderHistoryData) {
    super(data, defaultLogisticOrderHistoryData);
  }
}

export default defaultLogisticOrderHistoryData;
