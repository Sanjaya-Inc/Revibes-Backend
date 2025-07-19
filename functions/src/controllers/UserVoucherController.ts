import { TGetUserRes } from "./../dto/user";
import COLLECTION_MAP from "../constant/db";
import { wrapError } from "../utils/decorator/wrapError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import UserVoucher, { UserVoucherStatus } from "../models/UserVoucher";
import { TGetUserVoucher, TGetUserVoucherRes } from "../dto/userVoucher";
import { Transaction } from "firebase-admin/firestore";
import Voucher from "../models/Voucher";

export class UserVoucherController {
  @wrapError
  public static async getVouchers(
    user: TGetUserRes,
    filters: TPaginateConstruct<UserVoucher>,
  ): Promise<TPaginatedPage<UserVoucher>> {
    filters.construct = UserVoucher;
    filters.ref = user.ref;
    filters.addQuery = (q) =>
      q.where("status", "==", UserVoucherStatus.AVAILABLE);

    return createPage<UserVoucher>(COLLECTION_MAP.USER_VOUCHER, filters);
  }

  @wrapError
  public static async getVoucher(
    user: TGetUserRes,
    { code, status }: TGetUserVoucher,
  ): Promise<TGetUserVoucherRes | null> {
    let query = user.ref
      .collection(COLLECTION_MAP.USER_VOUCHER)
      .where("code", "==", code);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const ref = doc.ref;
      const data = new UserVoucher(doc.data());

      return {
        data,
        ref,
      };
    } else {
      return null;
    }
  }

  @wrapError
  public static async getVouchersByCode(
    user: TGetUserRes,
    { code, status }: TGetUserVoucher,
  ): Promise<UserVoucher[]> {
    let query = user.ref
      .collection(COLLECTION_MAP.USER_VOUCHER)
      .where("code", "==", code);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => new UserVoucher(d.data()));
    } else {
      return [];
    }
  }

  @wrapError
  public static async invalidateVoucher(
    user: TGetUserRes,
    voucher: UserVoucher,
  ): Promise<void> {
    if (voucher.alreadyExpired()) {
      voucher.status = UserVoucherStatus.EXPIRED;
    } else {
      voucher.status = UserVoucherStatus.UNAVAILABLE;
    }

    await user.ref
      .collection(COLLECTION_MAP.USER_VOUCHER)
      .doc(voucher.id)
      .update({ status: voucher.status });
  }

  @wrapError
  public static txReceiveVoucher(
    user: TGetUserRes,
    voucher: Voucher,
    qty: number,
    tx: Transaction,
  ) {
    for (let i = 0; i < qty; i++) {
      const userVoucherRef = user.ref
        .collection(COLLECTION_MAP.USER_VOUCHER)
        .doc();
      const newUserVoucher = new UserVoucher({
        id: userVoucherRef.id,
        voucherId: voucher.id,
        code: voucher.code,
        status: UserVoucherStatus.AVAILABLE,
        // expiredAt:  // should add expired rules
      });
      tx.set(userVoucherRef, newUserVoucher.toObject());
    }
  }

  @wrapError
  public static txUseVoucher(user: TGetUserRes, id: string, tx: Transaction) {
    const timestamp = new Date();
    const userVoucherRef = user.ref
      .collection(COLLECTION_MAP.USER_VOUCHER)
      .doc(id);
    tx.update(userVoucherRef, {
      updatedAt: timestamp,
      claimedAt: timestamp,
      status: UserVoucherStatus.REDEEMED,
    });

    // tx.delete(userVoucherRef.collection(COLLECTION_MAP.USER_VOUCHER).doc());
  }
}
