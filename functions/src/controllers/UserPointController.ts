import COLLECTION_MAP from "../constant/db";
import { TAddUserPoint, TGetUserRes } from "../dto/user";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import { UserController } from "./UserController";
import { Transaction } from "firebase-admin/firestore";

export class UserPointController {
  @wrapError
  public static async addUserPoint({
    id,
    amount,
  }: TAddUserPoint): Promise<void> {
    const user = await UserController.getUser({ id });
    if (!user) {
      throw new AppError(404, "USER.NOT_FOUND");
    }

    if (user.data.email === process.env.ADMIN_ROOT_MAIL) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await db
      .collection(COLLECTION_MAP.USER)
      .doc(id)
      .update({
        points: user.data.points + amount,
      });
  }

  @wrapError
  public static txDeductPoint(
    user: TGetUserRes,
    amount: number,
    tx: Transaction,
  ) {
    if (!user.data.hasMinimumBalance(amount)) {
      throw new AppError(400, "USER.POINT_INSUFFICIENT");
    }
    tx.update(user.ref, { points: user.data.decrease(amount) });
  }
}
