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
import db from "../utils/db";
import COLLECTION_MAP from "../constant/db";
import AppError from "../utils/formatter/AppError";
import User, { UserRole } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";

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
      throw new AppError(400, "AUTH.EMAIL_USED")
    }

    const userAuth = await admin.auth().createUser({
      displayName,
      email,
      phoneNumber,
      password,
    });

    const user = await UserController.createUser({
      id: userAuth.uid,
      email,
      displayName,
      phoneNumber,
      password,
      role: UserRole.USER,
    });

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
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
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return tokens;
  }

  @wrapError
  public static async login({ email, password }: TLogin): Promise<TLoginRes> {
    const user = await UserController.getUserByEmail(email);
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
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return { user: user.getPublicFields(), tokens };
  }

  @wrapError
  public static async loginWithGoogle({
    token,
  }: TRefresh): Promise<TLoginWithGoogleRes> {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const id = decodedToken.uid;
    const user = await UserController.getUser(id);
    if (!user) {
      throw new AppError(401, "AUTH.USER_OR_PASS_INVALID");
    }

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return { user, tokens };
  }

  @wrapError
  public static async logout(user: User): Promise<void> {
    db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
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
      accessTokenExpiresAt: newTokens.accessTokenExpiresAt,
      refreshToken: newTokens.refreshToken,
      refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt,
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
