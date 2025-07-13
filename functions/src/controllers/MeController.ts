import COLLECTION_MAP from "../constant/db";
import { TChangePassword } from "../dto/me";
import { db } from "../utils/firebase";
import User from "../models/User";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import UserVoucher, { UserVoucherStatus } from "../models/UserVoucher";
import { TGetUserRes } from "../dto/user";
import { and, where } from "firebase/firestore";
import UserDailyReward from "../models/UserDailyReward";
import { AppSettingController } from "./AppSettingController";
import { WriteBatch } from "firebase-admin/firestore";
import { isDateToday } from "../utils/date";
import { TRemoveUserDevice, TSaveUserDevice } from "../dto/userDevice";
import UserDevice from "../models/userDevice";

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

  @wrapError
  public static async generateClaimableRewards(
    user: TGetUserRes,
    batch?: WriteBatch,
  ): Promise<UserDailyReward[]> {
    const setting = await AppSettingController.getSetting();

    const { days, initialPoint, multiplier } = setting.dailyReward;

    const claimables: UserDailyReward[] = [];
    const dbBatch = batch ?? db.batch();
    const userDailyRewardsRef = user.ref.collection(
      COLLECTION_MAP.USER_DAILY_REWARD,
    );
    Array.from({ length: days }, (_, i) => i).forEach((i) => {
      const docRef = userDailyRewardsRef.doc();
      const newClaimable = new UserDailyReward({
        id: docRef.id,
        index: i + 1,
        amount: initialPoint + i * multiplier,
      });
      claimables.push(newClaimable);

      dbBatch.set(docRef, newClaimable.toObject());
    });

    await dbBatch.commit();

    return claimables;
  }

  @wrapError
  public static async getDailyRewards(
    user: TGetUserRes,
  ): Promise<UserDailyReward[]> {
    const snapshot = await user.ref
      .collection(COLLECTION_MAP.USER_DAILY_REWARD)
      .orderBy("index", "asc")
      .get();
    let claimables: UserDailyReward[] = [];
    snapshot.forEach((doc) => {
      claimables.push(new UserDailyReward(doc.data()));
    });

    if (!claimables.length) {
      claimables = await this.generateClaimableRewards(user);
    }

    return claimables;
  }

  @wrapError
  public static async claimDailyRewards(user: TGetUserRes): Promise<void> {
    const claimables = await this.getDailyRewards(user);

    // loop all reward and get 1 of not claimed reward in progress row
    for (let i = 0; i < claimables.length; i++) {
      const item = claimables[i];
      if (item.claimedAt) {
        continue;
      }

      const prevIndex = i - 1;
      if (prevIndex !== -1) {
        const lastClaimed = claimables[prevIndex];
        if (lastClaimed.claimedAt && isDateToday(lastClaimed.claimedAt)) {
          throw new AppError(403, "ME.CANNOT_CLAIM_TWICE_A_DAY");
        }
      }

      const batch = db.batch();
      batch.update(user.ref, {
        points: user.data.addPoint(item.amount),
      });

      if (i == claimables.length - 1) {
        for (const c of claimables) {
          const claimableRef = user.ref
            .collection(COLLECTION_MAP.USER_DAILY_REWARD)
            .doc(c.id);
          batch.delete(claimableRef);
        }
        await this.generateClaimableRewards(user, batch);
      } else {
        console.log("check 2 ======")
        const claimableRef = user.ref
          .collection(COLLECTION_MAP.USER_DAILY_REWARD)
          .doc(item.id);
        batch.update(claimableRef, {
          claimedAt: new Date(),
        });
      }

      await batch.commit();
      return;
    }
  }

  @wrapError
  public static async getVouchers(
    user: TGetUserRes,
    filters: TPaginateConstruct,
  ): Promise<TPaginatedPage<UserVoucher>> {
    filters.ref = user.ref;
    filters.addQuery = (q) =>
      q.where(
        and(
          where("status", "!=", UserVoucherStatus.REDEEMED),
          where("status", "!=", UserVoucherStatus.EXPIRED),
        ),
      );
    const { items, pagination } = await createPage<UserVoucher>(
      COLLECTION_MAP.VOUCHER,
      filters,
    );

    const vouchers = items.map((item) =>
      new UserVoucher(item).getPublicFields(),
    );

    return {
      items: vouchers,
      pagination,
    };
  }

  @wrapError
  public static async getDevices(user: TGetUserRes): Promise<UserDevice[]> {
    const snapshot = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .get();

    const devices: UserDevice[] = [];
    snapshot.forEach((doc) => {
      devices.push(new UserDevice({ ...doc.data() }));
    });

    return devices;
  }

  @wrapError
  public static async saveDevice(
    user: TGetUserRes,
    data: TSaveUserDevice,
  ): Promise<UserDevice> {
    const result = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .where("deviceToken", "==", data.deviceToken)
      .get();

    if (result.empty) {
      const docRef = user.ref.collection(COLLECTION_MAP.USER_DEVICE).doc();

      const device = new UserDevice({ ...data, id: docRef.id });
      device.extractType();

      await docRef.set(device.toObject());

      return device;
    } else {
      const snapshot = result.docs[0];
      const device = new UserDevice(snapshot.data());
      device.fcmToken = data.fcmToken;
      device.updatedAt = new Date();

      await user.ref
        .collection(COLLECTION_MAP.USER_DEVICE)
        .doc(device.id)
        .update(device.toObject());
      return device;
    }
  }

  @wrapError
  public static async removeDevice(
    user: TGetUserRes,
    { id }: TRemoveUserDevice,
  ): Promise<void> {
    const device = await user.ref
      .collection(COLLECTION_MAP.USER_DEVICE)
      .doc(id)
      .get();

    if (!device.exists) {
      throw new AppError(404, "USER_DEVICE.NOT_FOUND");
    }

    await user.ref.collection(COLLECTION_MAP.USER_DEVICE).doc(id).delete();
  }
}
