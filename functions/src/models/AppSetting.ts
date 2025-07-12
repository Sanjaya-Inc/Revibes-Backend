import BaseModel from "./BaseModel";
import { LogisticItemType } from "./LogisticItem";

export type TAppSettingData = Partial<AppSetting>;

export type TPointSetting = { [key in LogisticItemType]: number };

export type TDailyReward = {
  days: number;
  initialPoint: number;
  multiplier: number;
};

export const defaultAppSettingData: TAppSettingData = {
  point: {
    organic: 5,
    "non-organic": 5,
    b3: 5,
  },
  dailyReward: {
    days: 7,
    initialPoint: 5,
    multiplier: 5,
  },
};

export class AppSetting extends BaseModel {
  point!: TPointSetting;
  dailyReward!: TDailyReward;

  constructor(data: TAppSettingData) {
    super(data, defaultAppSettingData);
  }

  getPoint(type: LogisticItemType): number {
    return this.point[type];
  }
}

export const defaultSetting: AppSetting = new AppSetting(defaultAppSettingData);

export default AppSetting;
