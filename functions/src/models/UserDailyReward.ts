import BaseModel from "./BaseModel";

export type TUserDailyRewardData = Partial<UserDailyReward>;

export const defaultUserDailyRewardData: TUserDailyRewardData = {
  id: "",
  amount: 0,
  createdAt: new Date(),
  claimedAt: null,
};

export class UserDailyReward extends BaseModel {
  id!: string;
  amount!: number;
  createdAt!: Date;
  claimedAt!: Date | null;

  constructor(data: TUserDailyRewardData) {
    super(data, defaultUserDailyRewardData);
  }
}

export default UserDailyReward;
