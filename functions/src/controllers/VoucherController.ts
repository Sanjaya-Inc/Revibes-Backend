import COLLECTION_MAP from "../constant/db";
import {
  BasePath,
  getFileStorageInstance,
} from "../utils/firebase/fileStorage";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import {
  TCreateVoucher,
  TDeleteVoucher,
  TGetVoucher,
  TGetVoucherRes,
} from "../dto/voucher";
import Voucher, { TVoucherData, TVoucherValue } from "../models/Voucher";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import User, { UserRole } from "../models/User";
import { and, where } from "firebase/firestore";
import { Filter } from "firebase-admin/firestore";
import { getDocsByIds } from "../utils/firestoreCommonQuery";

export class VoucherController {
  @wrapError
  public static async getVoucher({
    id,
  }: TGetVoucher): Promise<TGetVoucherRes | null> {
    const voucherRef = db.collection(COLLECTION_MAP.VOUCHER).doc(id);

    const voucherSnapshot = await voucherRef.get();
    const voucherDoc = voucherSnapshot.data();
    if (!voucherDoc) {
      return null;
    }
    const voucher = new Voucher(voucherDoc);

    return {
      data: voucher,
      ref: voucherRef,
      snapshot: voucherSnapshot,
    };
  }

  @wrapError
  public static async getVouchers(
    user: User,
    filters: TPaginateConstruct<Voucher>,
  ): Promise<TPaginatedPage<Voucher>> {
    filters.construct = Voucher;
    // user will only be able to view list of voucher that claimable
    if (user.role == UserRole.USER) {
      const now = new Date();
      filters.addQuery = (q) =>
        q.where(
          and(where("availableAt", "<=", now), where("expiredAt", ">=", now)),
        );
    }

    const { items, pagination } = await createPage<Voucher>(
      COLLECTION_MAP.VOUCHER,
      filters,
    );
    return {
      items,
      pagination,
    };
  }

  @wrapError
  public static async createVoucher({
    code,
    name,
    description,
    type,
    amount,
    conditions,
    claimPeriodStart = new Date(),
    claimPeriodEnd = null,
    image,
  }: TCreateVoucher): Promise<Voucher> {
    const filters = [
      Filter.where("code", "==", code),
      Filter.where("claimPeriodStart", ">=", claimPeriodStart),
    ];

    if (claimPeriodEnd !== null) {
      filters.push(Filter.where("claimPeriodEnd", "<=", claimPeriodEnd));
    } else {
      // Only use '==' operator for null in Firestore
      filters.push(Filter.where("claimPeriodEnd", "==", null));
    }

    const result = await db
      .collection(COLLECTION_MAP.VOUCHER)
      .where(Filter.and(...filters))
      .get();

    if (result.docs?.length > 0) {
      throw new AppError(400, "VOUCHER_CODE.CODE_USED_FOR_THIS_PERIOD");
    }

    if (claimPeriodEnd) {
      if (claimPeriodEnd < claimPeriodStart) {
        throw new AppError(400, "VOUCHER_CODE.INVALID_PERIOD_RANGE");
      }
    }

    const docRef = db.collection(COLLECTION_MAP.VOUCHER).doc();

    let imageUri = "";
    if (image) {
      [imageUri] = await getFileStorageInstance().uploadFile(
        image,
        { public: true },
        BasePath.VOUCHER,
        docRef.id,
      );
    }

    const value: TVoucherValue = {
      type: type,
      amount: amount,
    };

    claimPeriodStart ??= new Date();

    const data: TVoucherData = {
      id: docRef.id,
      code,
      name,
      description,
      value,
      conditions,
      imageUri,
      claimPeriodStart,
      claimPeriodEnd,
    };

    const voucher = new Voucher(data);

    await docRef.set(voucher.toObject());

    return voucher;
  }

  @wrapError
  public static async deleteVoucher({ id }: TDeleteVoucher): Promise<void> {
    // Remove file from Firebase Storage
    const voucherRes = await this.getVoucher({ id });

    if (!voucherRes) {
      throw new AppError(404, "VOUCHER.NOT_FOUND");
    }

    const { data: voucher, ref: voucherRef } = voucherRes;
    if (new Date() > voucher.claimPeriodStart) {
      await voucherRef.update({
        claimPeriodEnd: new Date(),
      });
      return;
    }

    if (voucher.imageUri) {
      await getFileStorageInstance().removeFile(voucher.imageUri);
    }

    await db.collection(COLLECTION_MAP.VOUCHER).doc(id).delete();
  }

  @wrapError
  public static async getAvailableVoucherByIds(
    ids: string[],
  ): Promise<Voucher[]> {
    return getDocsByIds<Voucher>(COLLECTION_MAP.VOUCHER, ids, {
      addQuery: (q) => q.where("isAvailable", "==", true),
      construct: Voucher,
    });
  }
}
