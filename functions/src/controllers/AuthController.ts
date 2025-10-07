import {
  TLogin,
  TTokenPairRes,
  TRefresh,
  TSignup,
  TSignupRes,
  TLoginRes,
  TLoginWithGoogleRes,
  TSignupPhone,
} from "../dto/auth";
import AppError from "../utils/formatter/AppError";
import User, { UserRole } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import { UserMissionController } from "./UserMissionController";
import PhoneNumberUtil from "../utils/phoneNumber";

import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import { UserController } from "./UserController";
import { UserRecord } from "firebase-admin/auth";
import admin from "firebase-admin";

export class AuthController {
  @wrapError
  public static async signup({
    displayName,
    email,
    phoneNumber,
    password,
  }: TSignup): Promise<TSignupRes> {
    const normalizedPhoneNumber = phoneNumber
      ? PhoneNumberUtil.normalizePhoneNumber(phoneNumber)
      : undefined;

    const existingUserByEmail = await UserController.getUserByEmail(email);
    if (existingUserByEmail) {
      throw new AppError(400, "AUTH.EMAIL_USED");
    }

    if (normalizedPhoneNumber) {
      const existingUserByPhone = await UserController.getUserByPhoneNumber(
        normalizedPhoneNumber
      );
      if (existingUserByPhone) {
        throw new AppError(400, "AUTH.PHONE_USED");
      }
    }

    let userAuth: UserRecord;
    try {
      userAuth = await admin.auth().createUser({
        displayName,
        email,
        phoneNumber: normalizedPhoneNumber,
        password,
      });
    } catch (e: any) {
      if (e.errorInfo?.code === "auth/phone-number-already-exists") {
        throw new AppError(400, "AUTH.PHONE_USED");
      } else if (e.errorInfo?.code === "auth/email-already-exists") {
        throw new AppError(400, "AUTH.EMAIL_USED");
      } else {
        throw new AppError(500, "AUTH.INTERNAL_SERVER_ERROR");
      }
    }

    const user = await UserController.createUser(
      {
        id: userAuth.uid,
        email,
        displayName,
        phoneNumber: normalizedPhoneNumber,
        password,
        role: UserRole.USER,
      },
      { skipCheck: true }
    );

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    UserMissionController.assignAutomaticMissions(user.id);

    return { user: user.getPublicFields(), tokens };
  }

  @wrapError
  public static async signupWithPhone({
    displayName,
    phoneNumber,
    email,
    password,
  }: TSignupPhone): Promise<TSignupRes> {
    const normalizedPhoneNumber =
      PhoneNumberUtil.normalizePhoneNumber(phoneNumber);

    const existingUserByPhone = await UserController.getUserByPhoneNumber(
      normalizedPhoneNumber
    );
    if (existingUserByPhone) {
      throw new AppError(400, "AUTH.PHONE_USED");
    }

    if (email) {
      const existingUserByEmail = await UserController.getUserByEmail(email);
      if (existingUserByEmail) {
        throw new AppError(400, "AUTH.EMAIL_USED");
      }
    }

    let userAuth: UserRecord;
    try {
      userAuth = await admin.auth().createUser({
        displayName,
        email,
        phoneNumber: normalizedPhoneNumber,
        password,
      });
    } catch (e: any) {
      if (e.errorInfo?.code === "auth/phone-number-already-exists") {
        throw new AppError(400, "AUTH.PHONE_USED");
      } else if (e.errorInfo?.code === "auth/email-already-exists") {
        throw new AppError(400, "AUTH.EMAIL_USED");
      } else {
        throw new AppError(500, "AUTH.INTERNAL_SERVER_ERROR");
      }
    }

    const user = await UserController.createUser(
      {
        id: userAuth.uid,
        email: email || "",
        displayName,
        phoneNumber: normalizedPhoneNumber,
        password,
        role: UserRole.USER,
      },
      { skipCheck: true }
    );

    const tokens = user.generateTokens();
    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      accessToken: tokens.accessToken,
      accessTokenExpiredAt: tokens.accessTokenExpiredAt,
      refreshToken: tokens.refreshToken,
      refreshTokenExpiredAt: tokens.refreshTokenExpiredAt,
    });

    UserMissionController.assignAutomaticMissions(user.id);

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

    // Async task
    UserMissionController.assignAutomaticMissions(user.id);

    return tokens;
  }

  @wrapError
  public static async login({
    identifier,
    password,
  }: TLogin): Promise<TLoginRes> {
    let user = await UserController.getUserByIdentifier(identifier);

    if (
      PhoneNumberUtil.isEmail(identifier) &&
      identifier === process.env.ADMIN_ROOT_MAIL &&
      !user
    ) {
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
