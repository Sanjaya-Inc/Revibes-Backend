import admin from "firebase-admin";
import COLLECTION_MAP from "../constant/db";
import {
  TAddUserPoint,
  TChangeUserStatus,
  TCreateUser,
  TGetUser,
  TGetUserRes,
} from "../dto/user";
import { db, generateId } from "../utils/firebase";
import User, { TUserData, UserRole, UserStatus } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import AppError from "../utils/formatter/AppError";
import { TChangePassword } from "../dto/me";

export type TCreateUserOpt = {
  skipCheck?: boolean;
};

export class UserController {
  @wrapError
  public static async createUser(
    {
      id = generateId(),
      email,
      displayName,
      phoneNumber = "",
      password,
      role,
    }: TCreateUser,
    { skipCheck }: TCreateUserOpt = {},
  ): Promise<User> {
    const hashedPassword = password
      ? await User.hashPassword(password)
      : undefined;
    const data: TUserData = {
      id,
      email,
      displayName,
      phoneNumber,
      password: hashedPassword,
      points: 0,
      role,
      status: UserStatus.ACTIVE,
      accessTokenExpiredAt: null,
      refreshTokenExpiredAt: null,
    };

    if (!skipCheck) {
      const userRecord = await this.getUserByEmail(email);
      if (userRecord) {
        throw new AppError(400, "USER.EMAIL_USED");
      }
    }

    const user = new User(data);

    await db.collection(COLLECTION_MAP.USER).doc(id).set(user.toObject());

    return user;
  }

  @wrapError
  public static async getUsers(
    filters: TPaginateConstruct,
  ): Promise<TPaginatedPage<User>> {
    const { items, pagination } = await createPage<User>(
      COLLECTION_MAP.USER,
      filters,
    );

    const users = items.map((item) => new User(item).getPublicFields());

    return {
      items: users,
      pagination,
    };
  }

  @wrapError
  public static async getUser({ id }: TGetUser): Promise<User | null> {
    const userSnapshot = await db.collection(COLLECTION_MAP.USER).doc(id).get();
    const userDoc = userSnapshot.data();
    if (!userDoc) {
      return null;
    }
    return new User(userDoc);
  }

  @wrapError
  public static async getUserByEmail(email: string): Promise<User | null> {
    const userSnapshot = await db
      .collection(COLLECTION_MAP.USER)
      .where("email", "==", email)
      .get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }

  @wrapError
  public static async getUserByAccessToken(
    token: string,
  ): Promise<TGetUserRes | null> {
    const result = await db
      .collection(COLLECTION_MAP.USER)
      .where("accessToken", "==", token)
      .get();
    if (result.empty) {
      return null;
    }

    const snapshot = result.docs[0];
    const userDoc = snapshot.data();
    const data = new User(userDoc);

    const ref = db.collection(COLLECTION_MAP.USER).doc(data.id);

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getUserByRefreshToken(
    token: string,
  ): Promise<User | null> {
    const userSnapshot = await db
      .collection(COLLECTION_MAP.USER)
      .where("refreshToken", "==", token)
      .get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }

  @wrapError
  public static async generateVerifyToken(user: User): Promise<string> {
    if (!user.verifyToken) {
      const verifyToken = await admin.auth().createCustomToken(user.id);
      const userDocRef = db.collection(COLLECTION_MAP.USER).doc(user.id);
      await userDocRef.update({
        verifyToken,
      });
      return verifyToken;
    } else {
      return user.verifyToken;
    }
  }

  @wrapError
  public static async changeUserStatus({
    id,
    status,
  }: TChangeUserStatus): Promise<void> {
    const user = await UserController.getUser({ id });
    if (!user) {
      throw new AppError(404, "USER.NOT_FOUND");
    }

    if (user.email === process.env.ADMIN_ROOT_MAIL) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await db.collection(COLLECTION_MAP.USER).doc(id).update({
      status: status,
    });
  }

  @wrapError
  public static async addUserPoint({
    id,
    amount,
  }: TAddUserPoint): Promise<void> {
    const user = await UserController.getUser({ id });
    if (!user) {
      throw new AppError(404, "USER.NOT_FOUND");
    }

    if (user.email === process.env.ADMIN_ROOT_MAIL) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await db
      .collection(COLLECTION_MAP.USER)
      .doc(id)
      .update({
        points: user.points + amount,
      });
  }

  @wrapError
  public static async initAdminRoot(): Promise<User | null> {
    const adminMail = process.env.ADMIN_ROOT_MAIL || "";
    const user = await UserController.getUserByEmail(adminMail);
    if (user) {
      return null;
    }

    return UserController.createUser({
      displayName: "Admin Root",
      email: adminMail,
      password: process.env.ADMIN_ROOT_PASS,
      phoneNumber: "",
      role: UserRole.ADMIN,
    });
  }

  @wrapError
  public static async getSelfProfile(user: User): Promise<User> {
    return user.getDetailFields();
  }

  @wrapError
  public static async changeSelfPassword(
    user: User,
    { oldPassword, newPassword }: TChangePassword,
  ): Promise<void> {
    const passMatch = await user.comparePassword(oldPassword);
    if (!passMatch) {
      throw new AppError(400, "USER.OLD_PASS_INVALID");
    }

    const samePass = await user.comparePassword(newPassword);
    if (samePass) {
      throw new AppError(400, "USER.NEW_PASS_SAME");
    }

    const hashedPassword = await User.hashPassword(newPassword);

    await db.collection(COLLECTION_MAP.USER).doc(user.id).update({
      password: hashedPassword,
    });
  }
}
