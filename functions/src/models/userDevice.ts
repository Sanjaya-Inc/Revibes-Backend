import BaseModel from "./BaseModel";

export type TUserDeviceData = Partial<UserDevice>;

export enum DeviceType {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

export const defaultUserDeviceData: TUserDeviceData = {
  id: "",
  deviceToken: "",
  fcmToken: "",
  deviceType: DeviceType.DESKTOP,
  userAgent: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class UserDevice extends BaseModel {
  id!: string;
  deviceToken!: string;
  fcmToken!: string;
  deviceType!: DeviceType;
  userAgent!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TUserDeviceData) {
    super(data, defaultUserDeviceData);
  }

  extractType(): DeviceType {
    const ua = this.userAgent.toLowerCase();

    this.deviceType = DeviceType.DESKTOP;
    if (
      /mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/.test(
        ua,
      )
    ) {
      this.deviceType = DeviceType.MOBILE;
    }

    if (/ipad|android(?!.*mobile)|tablet|kindle|playbook/.test(ua)) {
      this.deviceType = DeviceType.TABLET;
    }

    return this.deviceType;
  }
}

export default UserDevice;
