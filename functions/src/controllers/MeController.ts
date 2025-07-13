import COLLECTION_MAP from "../constant/db";
import { TChangePassword } from "../dto/me";
import { db } from "../utils/firebase";
import User from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class MeController {
  @wrapError
  public static async getProfile(user: User): Promise<User> {
    return user.getDetailFields();
  }

  @wrapError
  public static async changePassword(
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
