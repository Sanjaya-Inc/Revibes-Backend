import {
  generateAccessToken,
  generateRefreshToken,
  TJwtPayload,
} from "./../utils/jwt";
import BaseModel from "./BaseModel";
import bcrypt from "bcrypt";

export type TUserData = Partial<User>;

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export const publicFields: (keyof User)[] = [
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
  "lastClaimedDate",
];

export type TUserMetadata = {
  role?: UserRole;
  displayName?: string;
};

export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export class User extends BaseModel {
  id!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
  displayName!: string;
  email!: string;
  phoneNumber?: string;
  password?: string;
  points!: number;
  lastClaimedDate?: Date | null;

  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;

  verifyToken?: string;
  status!: UserStatus;

  constructor(data: TUserData) {
    super(data);
    Object.assign(this, { ...data });

    this.setDate("accessTokenExpiresAt", data);
    this.setDate("refreshTokenExpiresAt", data);
  }

  hasAccess(): boolean {
    return (
      !!this.accessToken &&
      !!this.accessTokenExpiresAt &&
      this.accessTokenExpiresAt > new Date()
    );
  }

  hasRefresh(): boolean {
    return (
      !!this.refreshToken &&
      !!this.refreshTokenExpiresAt &&
      this.refreshTokenExpiresAt > new Date()
    );
  }

  generateTokens() {
    const jwtPayload: TJwtPayload = {
      id: this.id ?? "",
      email: this.email ?? "",
      displayName: this.displayName ?? "",
    };
    [this.accessToken, this.accessTokenExpiresAt] =
      generateAccessToken(jwtPayload);
    [this.refreshToken, this.refreshTokenExpiresAt] =
      generateRefreshToken(jwtPayload);

    return {
      accessToken: this.accessToken,
      accessTokenExpiresAt: this.accessTokenExpiresAt,
      refreshToken: this.refreshToken,
      refreshTokenExpiresAt: this.refreshTokenExpiresAt,
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
