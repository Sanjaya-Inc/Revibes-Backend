import BaseModel from "./BaseModel";

export type TUserDailyRewardData = Partial<UserDailyReward>;

export const defaultUserDailyRewardData: TUserDailyRewardData = {
  id: "",
  index: 1,
  amount: 0,
  createdAt: new Date(),
  claimedAt: null,
};

export class UserDailyReward extends BaseModel {
  id!: string;
  index!: number;
  amount!: number;
  createdAt!: Date;
  claimedAt!: Date | null;

  constructor(data: TUserDailyRewardData) {
    super(data, defaultUserDailyRewardData);
  }
}

export default UserDailyReward;
