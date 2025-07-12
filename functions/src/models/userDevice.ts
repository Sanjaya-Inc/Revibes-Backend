
import BaseModel from "./BaseModel";

export type TUserDeviceData = Partial<UserDevice>;

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export type TUserMetadata = {
  role?: UserRole;
  displayName?: string;
};

export const defaultUserDeviceData: TUserDeviceData = {
  id: "",
  fcmToken: "",
  userAgent: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class UserDevice extends BaseModel {
  id!: string;
  fcmToken!: string;
  userAgent!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TUserDeviceData) {
    super(data, defaultUserDeviceData);
  }
}

export default UserDevice;
