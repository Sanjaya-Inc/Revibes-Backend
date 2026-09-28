import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import { TGetUserRes } from "../dto/user";
import UserDailyReward from "../models/UserDailyReward";
import { AppSettingController } from "./AppSettingController";
import { UserPointController } from "./UserPointController";
import { UserPointHistorySourceType } from "../models/UserPointHistory";
import { WriteBatch } from "firebase-admin/firestore";
import { isDateToday } from "../utils/date";
import { dailyRewardAmounts } from "../models/dailyRewardSchedule";

export class UserDailyRewardController {
  @wrapError
  public static async generateClaimableRewards(
    user: TGetUserRes,
    batch?: WriteBatch,
  ): Promise<UserDailyReward[]> {
    const setting = await AppSettingController.getSetting();

    const claimables: UserDailyReward[] = [];
    const dbBatch = batch ?? db.batch();
    const userDailyRewardsRef = user.ref.collection(
      COLLECTION_MAP.USER_DAILY_REWARD,
    );
    const bannerText = setting.dailyReward?.bannerText ?? "";
    dailyRewardAmounts(setting.dailyReward).forEach((amount, i) => {
      const docRef = userDailyRewardsRef.doc();
      const newClaimable = new UserDailyReward({
        id: docRef.id,
        index: i + 1,
        amount,
        bannerText,
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
    const setting = await AppSettingController.getSetting();
    const bannerText = setting.dailyReward?.bannerText ?? "";
    const configuredAmount = setting.dailyReward?.initialPoint ?? 1;
    const snapshot = await user.ref
      .collection(COLLECTION_MAP.USER_DAILY_REWARD)
      .orderBy("index", "asc")
      .get();
    let claimables: UserDailyReward[] = [];
    snapshot.forEach((doc) => {
      const reward = new UserDailyReward(doc.data());
      reward.bannerText = bannerText;
      reward.applySettingAmount(configuredAmount);
      claimables.push(reward);
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

      await UserPointController.txAddPoint(user, {
        amount: item.amount,
        sourceType: UserPointHistorySourceType.DAILY_REWARD,
        sourceId: item.id,
      });

      const batch = db.batch();

      if (i == claimables.length - 1) {
        for (const c of claimables) {
          const claimableRef = user.ref
            .collection(COLLECTION_MAP.USER_DAILY_REWARD)
            .doc(c.id);
          batch.delete(claimableRef);
        }
        await this.generateClaimableRewards(user, batch);
      } else {
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
}
