import { Timestamp } from 'firebase-admin/firestore';
import { generateAccessToken, generateRefreshToken, TJwtPayload } from './../utils/jwt';
import BaseModel from "./BaseModel";
import bcrypt from "bcrypt";

export interface IUserData {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  points?: number;
  lastClaimedDate?: Date | null;

  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
}

export class User extends BaseModel {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  points?: number;
  lastClaimedDate?: Date | null;

  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;

  constructor(data: IUserData) {
    super();
    let {accessTokenExpiresAt, refreshTokenExpiresAt, ...newData} = data;
    if (accessTokenExpiresAt && accessTokenExpiresAt instanceof Timestamp) {
      accessTokenExpiresAt = accessTokenExpiresAt.toDate();
    }

    if (refreshTokenExpiresAt && refreshTokenExpiresAt instanceof Timestamp) {
      refreshTokenExpiresAt = refreshTokenExpiresAt.toDate();
    }

    Object.assign(this, {...newData, accessTokenExpiresAt, refreshTokenExpiresAt});
  }

  hasAccess(): boolean {
    return !!this.accessToken && !!this.accessTokenExpiresAt &&
      this.accessTokenExpiresAt > new Date();
  }

  hasRefresh(): boolean {
    return !!this.refreshToken && !!this.refreshTokenExpiresAt &&
      this.refreshTokenExpiresAt > new Date();
  }

  generateTokens() {
    const jwtPayload: TJwtPayload = {
      uid: this.uid ?? "",
      email: this.email ?? "",
      displayName: this.displayName ?? "",
    };
    [this.accessToken, this.accessTokenExpiresAt] = generateAccessToken(jwtPayload);
    [this.refreshToken, this.refreshTokenExpiresAt] = generateRefreshToken(jwtPayload);

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
}

export default User;
