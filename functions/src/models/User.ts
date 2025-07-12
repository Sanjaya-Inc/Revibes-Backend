import {
  generateAccessToken,
  generateRefreshToken,
  TJwtPayload,
} from "./../utils/jwt";
import BaseModel from "./BaseModel";
import bcrypt from "bcrypt";
import UserDailyReward from "./UserDailyReward";
import { UserDevice } from "./userDevice";

export type TUserData = Partial<User>;

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export const publicFields: (keyof User)[] = [
  "id",
  "role",
  "displayName",
  "createdAt",
  "updatedAt",
];

export const detailFields: (keyof User)[] = [
  "role",
  "createdAt",
  "displayName",
  "email",
  "phoneNumber",
  "points",
];

export type TUserMetadata = {
  role?: UserRole;
  displayName?: string;
};

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export const defaultUserData: TUserData = {
  id: "",
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  displayName: "",
  email: "",
  phoneNumber: null,
  password: null,
  points: 0,

  accessToken: null,
  refreshToken: null,
  accessTokenExpiredAt: null,
  refreshTokenExpiredAt: null,

  verifyToken: "",
  status: UserStatus.ACTIVE,

  // relation
  dailyRewards: [],
};

export class User extends BaseModel {
  id!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
  displayName!: string;
  email!: string;
  phoneNumber?: string | null;
  password?: string | null;
  points!: number;

  accessToken?: string | null;
  refreshToken?: string | null;
  accessTokenExpiredAt?: Date | null;
  refreshTokenExpiredAt?: Date | null;

  verifyToken?: string;
  status!: UserStatus;

  // relation
  dailyRewards!: UserDailyReward[];
  devices!: UserDevice[];

  constructor(data: TUserData) {
    super(data, defaultUserData);
  }

  addPoint(amount: number): number {
    this.points += amount;
    return this.points;
  }

  hasAccess(): boolean {
    return (
      !!this.accessToken &&
      !!this.accessTokenExpiredAt &&
      this.accessTokenExpiredAt > new Date()
    );
  }

  hasRefresh(): boolean {
    return (
      !!this.refreshToken &&
      !!this.refreshTokenExpiredAt &&
      this.refreshTokenExpiredAt > new Date()
    );
  }

  generateTokens() {
    const jwtPayload: TJwtPayload = {
      id: this.id ?? "",
      email: this.email ?? "",
      displayName: this.displayName ?? "",
    };
    [this.accessToken, this.accessTokenExpiredAt] =
      generateAccessToken(jwtPayload);
    [this.refreshToken, this.refreshTokenExpiredAt] =
      generateRefreshToken(jwtPayload);

    return {
      accessToken: this.accessToken,
      accessTokenExpiredAt: this.accessTokenExpiredAt,
      refreshToken: this.refreshToken,
      refreshTokenExpiredAt: this.refreshTokenExpiredAt,
    };
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.password && !password) {
      return false;
    }
    return await bcrypt.compare(password, this.password ?? "");
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }
}

export default User;
