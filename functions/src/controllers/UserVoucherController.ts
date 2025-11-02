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
import { Query, Transaction } from "firebase-admin/firestore";
import Voucher from "../models/Voucher";
import { getDocsByIds } from "../utils/firestoreCommonQuery";
import { VoucherController } from "./VoucherController";
import AppError from "../utils/formatter/AppError";

export type TGetUserVoucherOpt = {
  withMetadata?: boolean;
};

export class UserVoucherController {
  @wrapError
  public static async getVouchers(
    user: TGetUserRes,
    filters: TPaginateConstruct<UserVoucher>,
    { withMetadata }: TGetUserVoucherOpt = {},
  ): Promise<TPaginatedPage<UserVoucher>> {
    filters.construct = UserVoucher;
    filters.ref = user.ref;
    filters.addQuery = (q) =>
      q.where("status", "==", UserVoucherStatus.AVAILABLE);

    const { items, pagination } = await createPage<UserVoucher>(
      COLLECTION_MAP.USER_VOUCHER,
      filters,
    );
    if (withMetadata) {
      const voucherIds = items.map((item) => item.voucherId);
      if (voucherIds.length > 0) {
        const vouchers = await getDocsByIds<Voucher>(
          COLLECTION_MAP.VOUCHER,
          voucherIds,
          { construct: Voucher },
        );
        const voucherMap = new Map(vouchers.map((v) => [v.id, v]));
        items.forEach((item) => {
          item.metadata = voucherMap.get(item.voucherId) || null;
        });
      }
    }

    return { items, pagination };
  }

  @wrapError
  public static async getVoucher(
    user: TGetUserRes,
    { id, code, status }: TGetUserVoucher,
    { withMetadata }: TGetUserVoucherOpt = {},
  ): Promise<TGetUserVoucherRes | null> {
    let query: Query = user.ref.collection(COLLECTION_MAP.USER_VOUCHER);

    if (id) {
      query = query.where("id", "==", id);
    } else {
      query = query.where("code", "==", code);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const ref = doc.ref;
      const data = new UserVoucher(doc.data());

      if (withMetadata) {
        const voucher = await VoucherController.getVoucher(user, {
          id: data.voucherId,
        });
        data.metadata = voucher?.data;
      }

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
    if (!user.data.verified) {
      throw new AppError(403, "USER.NOT_VERIFIED");
    }

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
