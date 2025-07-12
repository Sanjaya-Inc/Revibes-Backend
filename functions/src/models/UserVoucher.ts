import BaseModel from "./BaseModel";

export type TUserVoucherData = Partial<UserVoucher>;

export enum UserVoucherStatus {
  UNAVAILABLE = "unavailable",
  AVAILABLE = "available",
  REDEEMED = "redeemed",
  EXPIRED = "expired",
}

export const publicFields: (keyof UserVoucher)[] = [
  "id",
  "voucherId",
  "status",
  "claimedAt",
  "expiredAt",
  "updatedAt",
];

export const defaultUserVoucherData: TUserVoucherData = {
  id: "",
  voucherId: "",
  status: UserVoucherStatus.AVAILABLE,
  claimedAt: new Date(),
  expiredAt: new Date(),
  updatedAt: new Date(),
};

export class UserVoucher extends BaseModel {
  id!: string;
  voucherId!: string;
  status!: UserVoucherStatus;
  claimedAt!: Date;
  expiredAt!: Date;
  updatedAt!: Date;

  constructor(data: TUserVoucherData) {
    super(data, defaultUserVoucherData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }
}

export default UserVoucher;
