import BaseModel from "./BaseModel";

export type TUserPointHistoryData = Partial<UserPointHistory>;

export const publicFields: (keyof UserPointHistory)[] = [
  "id",
  "timestamp",
  "sourceType",
  "sourceId",
  "symbol",
  "value",
  "prevValue",
  "newValue",
];

export const detailFields: (keyof UserPointHistory)[] = [
  "id",
  "timestamp",
  "sourceType",
  "sourceId",
  "symbol",
  "value",
  "prevValue",
  "newValue",
];

export enum UserPointHistorySourceType {
  MISSION = "mission",
  EXCHANGE = "exchange",
  LOGISTIC_ORDER = "logistic-order",
}

export enum UserPointHistorySymbol {
  MINUS = "minus",
  PLUS = "plus",
}

export const defaultUserPointHistoryData: TUserPointHistoryData = {
  id: "",
  timestamp: new Date(),
  sourceType: null,
  sourceId: null,
  symbol: UserPointHistorySymbol.MINUS,
  value: 0,
  prevValue: 0,
  newValue: 0,
};

export class UserPointHistory extends BaseModel {
  id!: string;
  timestamp!: Date;
  sourceType?: UserPointHistorySourceType | null;
  sourceId?: string | null;
  symbol!: UserPointHistorySymbol;
  value!: number;
  prevValue!: number;
  newValue!: number;

  constructor(data: TUserPointHistoryData) {
    super(data, defaultUserPointHistoryData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }
}

export default UserPointHistory;
