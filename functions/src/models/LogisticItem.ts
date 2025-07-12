import { FileStorage } from "../utils/firebase";
import AppSetting from "./AppSetting";
import BaseModel from "./BaseModel";

export type TLogisticItemData = Partial<LogisticItem>;

export enum LogisticItemType {
  ORGANIC = "organic",
  NON_ORGANIC = "non-organic",
  B3 = "b3",
}

export type TMedia = {
  uploadUrl: string;
  downloadUri: string;
  expiredAt: number;
};

export const defaultLogisticItemData: TLogisticItemData = {
  id: "",
  name: "",
  type: LogisticItemType.ORGANIC,
  weight: 0,
  media: [],
};

export class LogisticItem extends BaseModel {
  id!: string;
  name!: string;
  type!: LogisticItemType;
  weight!: number;
  media!: TMedia[];

  constructor(data: TLogisticItemData) {
    super(data, defaultLogisticItemData);
  }

  calculatePoint(setting: AppSetting) {
    return setting.getPoint(this.type);
  }

  async retrieveFullUrl(storage: FileStorage) {
    this.media = await Promise.all(
      this.media.map(async (m) => ({
        ...m,
        downloadUri: await storage.getFullUrl(m.downloadUri),
      })),
    );
  }
}

export default LogisticItem;
