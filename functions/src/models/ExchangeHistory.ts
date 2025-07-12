import BaseModel from "./BaseModel";

export type TExchangeHistoryData = Partial<ExchangeHistory>;

export const defaultExchangeHistoryData: TExchangeHistoryData = {
  id: "",
  userId: "",
  claimableId: null,
  createdAt: new Date(),
};

export class ExchangeHistory extends BaseModel {
  id!: string;
  userId!: string;
  claimableId?: string | null;
  createdAt!: Date;

  constructor(data: TExchangeHistoryData) {
    super(data, defaultExchangeHistoryData);
  }
}

export default ExchangeHistory;
