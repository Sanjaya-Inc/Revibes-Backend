import COLLECTION_MAP from "../constant/db";
import { TGetUserRes } from "../dto/user";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import { Transaction } from "firebase-admin/firestore";
import UserPointHistory, {
  UserPointHistorySymbol,
} from "../models/UserPointHistory";
import { TNewUserPoint } from "../dto/userPoint";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";

export class UserPointController {
  @wrapError
  public static async getHistories(
    user: TGetUserRes,
    filters: TPaginateConstruct<UserPointHistory>,
  ): Promise<TPaginatedPage<UserPointHistory>> {
    filters.construct = UserPointHistory;
    filters.ref = user.ref;
    filters.sortBy = "timestamp";

    return createPage<UserPointHistory>(
      COLLECTION_MAP.USER_POINT_HISTORY,
      filters,
    );
  }

  @wrapError
  public static async txAddPoint(
    user: TGetUserRes,
    { amount, sourceType, sourceId }: TNewUserPoint,
    tx?: Transaction,
  ): Promise<void> {
    const prevValue = user.data.points;
    const value = amount;
    const newValue = user.data.addPoint(amount);

    const updatedUserData = {
      points: user.data.points,
    };
    if (!tx) {
      await user.ref.update(updatedUserData);
    } else {
      tx.update(user.ref, updatedUserData);
    }

    const historyRef = user.ref
      .collection(COLLECTION_MAP.USER_POINT_HISTORY)
      .doc();
    const history = new UserPointHistory({
      id: historyRef.id,
      sourceType,
      sourceId,
      symbol: UserPointHistorySymbol.PLUS,
      value,
      prevValue,
      newValue,
    });

    if (!tx) {
      await historyRef.set(history.toObject());
    } else {
      tx.set(historyRef, history.toObject());
    }
  }

  @wrapError
  public static async txDeductPoint(
    user: TGetUserRes,
    { amount, sourceType, sourceId }: TNewUserPoint,
    tx: Transaction,
  ): Promise<void> {
    if (!user.data.hasMinimumBalance(amount)) {
      throw new AppError(400, "USER.POINT_INSUFFICIENT");
    }

    const prevValue = user.data.points;
    const value = amount;
    const newValue = user.data.decrease(amount);

    const updatedData = {
      points: user.data.points,
    };
    if (!tx) {
      await user.ref.update(updatedData);
    } else {
      tx.update(user.ref, updatedData);
    }

    const historyRef = user.ref
      .collection(COLLECTION_MAP.USER_POINT_HISTORY)
      .doc();
    const history = new UserPointHistory({
      id: historyRef.id,
      sourceType,
      sourceId,
      symbol: UserPointHistorySymbol.MINUS,
      value,
      prevValue,
      newValue,
    });

    if (!tx) {
      await historyRef.set(history.toObject());
    } else {
      tx.set(historyRef, history.toObject());
    }
  }
}
