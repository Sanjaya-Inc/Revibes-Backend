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
  "createdAt",
  "updatedAt",
];

export const defaultUserVoucherData: TUserVoucherData = {
  id: "",
  voucherId: "",
  code: "",
  status: UserVoucherStatus.AVAILABLE,
  claimedAt: null,
  expiredAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class UserVoucher extends BaseModel {
  id!: string;
  voucherId!: string;
  code!: string;
  status!: UserVoucherStatus;
  claimedAt?: Date | null;
  expiredAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TUserVoucherData) {
    super(data, defaultUserVoucherData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  alreadyExpired(): boolean {
    return Boolean(this.expiredAt && new Date() >= this.expiredAt);
  }
}

export default UserVoucher;
