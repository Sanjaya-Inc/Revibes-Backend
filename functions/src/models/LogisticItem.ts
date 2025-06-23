import BaseModel from "./BaseModel";

export type TLogisticItemData = Partial<LogisticItem>;

export const logisticItemTypes = ["organic", "non-organic", "b3"] as const;

export type LogisticItemType = (typeof logisticItemTypes)[number];

export type TMedia = {
  uploadUrl: string;
  downloadUri: string;
  expiredAt: number;
};

export class LogisticItem extends BaseModel {
  id!: string;
  name!: string;
  type!: LogisticItemType;
  weight!: number;
  media?: TMedia[];

  constructor(data: TLogisticItemData) {
    super();

    Object.assign(this, { ...data });
  }
}

export default LogisticItem;
