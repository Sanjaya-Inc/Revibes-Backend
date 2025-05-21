import COLLECTION_MAP from "../constant/db";
import { TCreateUser } from "../dto/user";
import db from "../utils/db";
import User from "../models/User";

export class UserController {
  public static async createUser({uid, email, displayName, phoneNumber, password}: TCreateUser): Promise<User> {
    const hashedPassword = password ? (await User.hashPassword(password)) : undefined;
    const data = {
      uid,
      email,
      displayName,
      phoneNumber,
      password: hashedPassword,
      points: 0,
      lastClaimedDate: null,
    };

    await db.collection(COLLECTION_MAP.USER).doc(uid).set(data);

    return new User(data);
  }

  public static async getUser(uid: string): Promise<User | null> {
    const userSnapshot = await db.collection(COLLECTION_MAP.USER).where("uid", "==", uid).get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }

  public static async getUserByEmail(email: string): Promise<User | null> {
    const userSnapshot = await db.collection(COLLECTION_MAP.USER).where("email", "==", email).get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }

  public static async getUserByAccessToken(token: string): Promise<User | null> {
    const userSnapshot = await db.collection(COLLECTION_MAP.USER).where("accessToken", "==", token).get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }

  public static async getUserByRefreshToken(token: string): Promise<User | null> {
    const userSnapshot = await db.collection(COLLECTION_MAP.USER).where("refreshToken", "==", token).get();
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0].data();
    return new User(userDoc);
  }
}

export default UserController;