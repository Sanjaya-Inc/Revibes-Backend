import BaseModel from "./BaseModel";

export type TUserDailyRewardData = Partial<UserDailyReward>;

export const defaultUserDailyRewardData: TUserDailyRewardData = {
  id: "",
  index: 1,
  amount: 0,
  createdAt: new Date(),
  claimedAt: null,
  bannerText: "",
};

export class UserDailyReward extends BaseModel {
  id!: string;
  index!: number;
  amount!: number;
  createdAt!: Date;
  claimedAt!: Date | null;
  bannerText!: string;
  constructor(data: TUserDailyRewardData) {
    super(data, defaultUserDailyRewardData);
  }

  applySettingAmount(configuredAmount: number) {
    // Claimed history rows keep the amount actually awarded.
    if (this.claimedAt) {
      return;
    }
    this.amount = configuredAmount;
  }
}

export default UserDailyReward;
