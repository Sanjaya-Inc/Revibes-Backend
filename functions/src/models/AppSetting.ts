import BaseModel from "./BaseModel";
import { LogisticItemType } from "./LogisticItem";

export type TAppSettingData = Partial<AppSetting>;

export type TPointSetting = {[key in LogisticItemType]: number};

export class AppSetting extends BaseModel {
  point!: TPointSetting;

  constructor(data: TAppSettingData) {
    super();

    Object.assign(this, data);
  }

  getPoint(type: LogisticItemType): number {
    return this.point[type];
  }
}

export const defaultSetting: AppSetting = new AppSetting({
  point: {
    "organic": 5,
    "non-organic": 5,
    "b3": 5,
  },
})

export default AppSetting;
