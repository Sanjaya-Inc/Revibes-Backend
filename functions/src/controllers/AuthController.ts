import admin from "firebase-admin";
import UserController from "./UserController";
import { TLogin, TTokenPairRes, TRefresh, TSignup, TSignupRes } from "../dto/auth";

import db from "../utils/db";
import COLLECTION_MAP from "../constant/db";
import AppError from "../utils/formatter/AppError";
import User from "../models/User";

export class AuthController {
  public static async signup({displayName, email, phoneNumber, password}: TSignup): Promise<TSignupRes> {
    const user = await admin.auth().createUser({
      displayName,
      email,
      phoneNumber,
      password,
    });

    await UserController.createUser({uid: user.uid, email, displayName, phoneNumber, password});

    const token = await admin.auth().createCustomToken(user.uid);

    return { token };
  }

  public static async signupWithGoogle({token}: TRefresh): Promise<TTokenPairRes> {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const uid = decodedToken.uid;
    const { email, displayName, phoneNumber } = await admin.auth().getUser(uid);

    const user = await UserController.createUser({uid, email: email!, displayName: displayName!, phoneNumber});

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.uid!).update({
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return tokens;
  }

  public static async login({email, password}: TLogin): Promise<TTokenPairRes> {
    const user = await UserController.getUserByEmail(email);
    if (!user) {
      throw new AppError(401, "USER_NOT_FOUND");
    }

    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
      throw new AppError(401, "REQ_INVALID_USER_PASSWORD");
    }

    if (!(await admin.auth().getUser(user.uid!)).emailVerified) {
      throw new AppError(403, "USER_NOT_VERIFIED");
    }

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.uid!).update({
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return tokens;
  }

  public static async loginWithGoogle({token}: TRefresh): Promise<TTokenPairRes> {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const uid = decodedToken.uid;
    const user = await UserController.getUser(uid);
    if (!user) {
      throw new AppError(401, "USER_NOT_FOUND");
    }

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.uid!).update({
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    });

    return tokens;
  }

  public static async logout(user: User): Promise<void> {
    db.collection(COLLECTION_MAP.USER).doc(user.uid!).update({
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });
  }

  public static async refresh({token}: TRefresh): Promise<TTokenPairRes> {
    const user = await UserController.getUserByRefreshToken(token);
    if (!user) { 
      throw new AppError(401, "USER_NOT_FOUND");
    }

    const newTokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.uid!).update({
      accessToken: newTokens.accessToken,
      accessTokenExpiresAt: newTokens.accessTokenExpiresAt,
      refreshToken: newTokens.refreshToken,
      refreshTokenExpiresAt: newTokens.refreshTokenExpiresAt,
    });

    return newTokens;
  }
}

export default AuthController;