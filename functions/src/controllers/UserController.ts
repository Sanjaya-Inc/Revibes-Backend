import admin from "firebase-admin";
import COLLECTION_MAP from "../constant/db";
import { TCreateUser } from "../dto/user";
import db from "../utils/db";
import User, { TUserData } from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";

export class UserController {
  @wrapError
  public static async createUser({
    id,
    email,
    displayName,
    phoneNumber,
    password,
    role,
  }: TCreateUser): Promise<User> {
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
      lastClaimedDate: null,
      role,
    };

    await db.collection(COLLECTION_MAP.USER).doc(id).set(data);

    return new User(data);
  }

  @wrapError
  public static async getUser(id: string): Promise<User | null> {
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
  ): Promise<User | null> {
    const userSnapshot = await db
      .collection(COLLECTION_MAP.USER)
      .where("accessToken", "==", token)
      .get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
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
  public static async getSelfProfile(user: User): Promise<User> {
    return user.getProfileFields();
  }
}
