import COLLECTION_MAP from "../constant/db";
import db from "../utils/db";

export class User {
  public static async createUser(uid: string, email?: string, displayName?: string, phoneNumber?: string): Promise<void> {
    await db.collection(COLLECTION_MAP.USER).doc(uid).set({
      displayName,
      email,
      phoneNumber,
      points: 0,
      lastClaimedDate: null,
    });
  }
}
