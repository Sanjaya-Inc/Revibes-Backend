import admin from "firebase-admin";
import { UserController } from "./UserController";
import {
  TLogin,
  TTokenPairRes,
  TRefresh,
  TSignup,
  TSignupRes,
  TLoginRes,
  TLoginWithGoogleRes,
} from "../dto/auth";
import { db } from "../utils/firebase";
import COLLECTION_MAP from "../constant/db";
import AppError from "../utils/formatter/AppError";
import User, { UserRole } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import { UserRecord } from "firebase-admin/auth";

export class AuthController {
  @wrapError
  public static async signup({
    displayName,
    email,
    phoneNumber,
    password,
  }: TSignup): Promise<TSignupRes> {
    if (phoneNumber?.startsWith("0")) {
      phoneNumber = "+62" + phoneNumber.slice(1);
    } else if (phoneNumber?.startsWith("62")) {
      phoneNumber = "+" + phoneNumber.slice(1);
    } else if (phoneNumber?.startsWith("8")) {
      phoneNumber = "+62" + phoneNumber.slice(1);
    }

    const userRecord = await UserController.getUserByEmail(email);
    if (userRecord) {
      throw new AppError(400, "AUTH.EMAIL_USED");
    }

    let userAuth: UserRecord;
    try {
      userAuth = await admin.auth().createUser({
        displayName,
        email,
        phoneNumber,
        password,
      });
    } catch (e: any) {
      if (e.errorInfo?.code === "auth/phone-number-already-exists") {
        throw new AppError(400, "AUTH.PHONE_USED");
      } else {
        throw new AppError(500, "AUTH.INTERNAL_SERVER_ERROR");
      }
    }

    const user = await UserController.createUser(
      {
        id: userAuth.uid,
        email,
        displayName,
        phoneNumber,
        password,
        role: UserRole.USER,
      },
      { skipCheck: true },
    );

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    return { user: user.getPublicFields(), tokens };
  }

  @wrapError
  public static async signupWithGoogle({
    token,
  }: TRefresh): Promise<TTokenPairRes> {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const id = decodedToken.uid;
    const { email, displayName, phoneNumber } = await admin.auth().getUser(id);

    const user = await UserController.createUser({
      id,
      email: email ?? "",
      displayName: displayName ?? "",
      phoneNumber,
    });

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    return tokens;
  }

  @wrapError
  public static async login({ email, password }: TLogin): Promise<TLoginRes> {
    let user = await UserController.getUserByEmail(email);

    if (email === process.env.ADMIN_ROOT_MAIL && !user) {
      user = await UserController.initAdminRoot();
    }

    if (!user) {
      throw new AppError(401, "AUTH.USER_OR_PASS_INVALID");
    }

    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
      throw new AppError(401, "AUTH.USER_OR_PASS_INVALID");
    }

    const tokens = user.generateTokens();

    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    return { user: user.getPublicFields(), tokens };
  }

  @wrapError
  public static async loginWithGoogle({
    token,
  }: TRefresh): Promise<TLoginWithGoogleRes> {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const id = decodedToken.uid;
    const user = await UserController.getUser({ id });
    if (!user) {
      throw new AppError(401, "AUTH.USER_OR_PASS_INVALID");
    }

    const tokens = user.data.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.data.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    return { user: user.data, tokens };
  }

  @wrapError
  public static async logout(user: User): Promise<void> {
    db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: null,
      accessTokenExpiredAt: null,
      refreshToken: null,
      refreshTokenExpiredAt: null,
    });
  }

  @wrapError
  public static async refresh({ token }: TRefresh): Promise<TTokenPairRes> {
    const user = await UserController.getUserByRefreshToken(token);
    if (!user) {
      throw new AppError(401, "AUTH.INVALID_TOKEN");
    }

    const newTokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: newTokens.accessToken,
      accessTokenExpiredAt: newTokens.accessTokenExpiredAt,
      refreshToken: newTokens.refreshToken,
      refreshTokenExpiredAt: newTokens.refreshTokenExpiredAt,
    });

    return newTokens;
  }

  @wrapError
  public static async getVerifyToken(user: User): Promise<string> {
    const token = UserController.generateVerifyToken(user);
    return token;
  }
}

export default AuthController;
