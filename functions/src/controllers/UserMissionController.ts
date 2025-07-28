import COLLECTION_MAP from "../constant/db";
import { wrapError } from "../utils/decorator/wrapError";
import { TGetUserRes } from "../dto/user";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import UserMission, { UserMissionStatus } from "../models/UserMission";
import {
  TClaimMission,
  TGetUserMissionRes,
  TUpdateMissionProgressByType,
} from "../dto/userMission";
import { TGetMission } from "../dto/mission";
import AppError from "../utils/formatter/AppError";
import { MissionController } from "./MissionController";
import { db } from "../utils/firebase";
import { UserPointController } from "./UserPointController";
import { UserPointHistorySourceType } from "../models/UserPointHistory";
import { getDocsByIds } from "../utils/firestoreCommonQuery";
import Mission from "../models/Mission";

export type TGetUserMissionOpt = {
  withMission?: boolean;
};

export class UserMissionController {
  @wrapError
  public static async getMissions(
    user: TGetUserRes,
    filters: TPaginateConstruct<UserMission>,
    { withMission }: TGetUserMissionOpt = {},
  ): Promise<TPaginatedPage<UserMission>> {
    filters.construct = UserMission;
    filters.ref = user.ref;
    filters.addQuery = (q) =>
      q.where("status", "in", [
        UserMissionStatus.AVAILABLE,
        UserMissionStatus.IN_PROGRESS,
      ]);

    const { items, pagination } = await createPage<UserMission>(
      COLLECTION_MAP.USER_MISSION,
      filters,
    );

    if (withMission) {
      // Get mission
      const missionIds = items.map((i) => i.missionId);
      const missions = await getDocsByIds<Mission>(
        COLLECTION_MAP.MISSION,
        missionIds,
        { construct: Mission },
      );

      items.forEach((i) => {
        i.mission = missions.find((m) => m.id === i.missionId);
      });
    }

    return {
      items,
      pagination,
    };
  }

  @wrapError
  public static async getMission(
    user: TGetUserRes,
    { id }: TGetMission,
  ): Promise<TGetUserMissionRes | null> {
    const ref = user.ref.collection(COLLECTION_MAP.USER_MISSION).doc(id);
    const snapshot = await ref.get();
    const doc = snapshot.data();
    if (!doc) {
      return null;
    }
    const data = new UserMission(doc);

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async updateProgressByType(
    user: TGetUserRes,
    { type, progress = 1 }: TUpdateMissionProgressByType,
  ): Promise<void> {
    const snapshot = await user.ref
      .collection(COLLECTION_MAP.USER_MISSION)
      .where("type", "==", type)
      .get();
    if (!snapshot) {
      throw new AppError(404, "USER_MISSION.NOT_FOUND");
    }

    if (snapshot.empty) {
      throw new AppError(404, "USER_MISSION.NOT_FOUND");
    }

    await db.runTransaction(async (transaction) => {
      // Update all matching documents
      snapshot.docs.forEach((doc) => {
        const userMission = new UserMission(doc.data());
        userMission.updatedAt = new Date();
        userMission.addProgress(progress);
        transaction.set(doc.ref, userMission.toObject());
      });
    });
  }

  @wrapError
  public static async claimMissions(
    user: TGetUserRes,
    data: TClaimMission,
  ): Promise<void> {
    const userMission = await this.getMission(user, data);
    if (!userMission) {
      throw new AppError(404, "USER_MISSION.NOT_FOUND");
    }

    if (!userMission.data.isClaimable()) {
      throw new AppError(403, "USER_MISSION.PROGRESS_NOT_FULFILLED");
    }

    const mission = await MissionController.getMission({
      id: userMission.data.missionId,
    });
    if (!mission) {
      throw new AppError(404, "MISSION.NOT_FOUND");
    }

    await db.runTransaction(async (transaction) => {
      userMission.data.status = UserMissionStatus.CLAIMED;
      transaction.update(userMission.ref, { status: userMission.data.status });

      await UserPointController.txAddPoint(
        user,
        {
          amount: mission.data.reward,
          sourceType: UserPointHistorySourceType.MISSION,
          sourceId: mission.data.id,
        },
        transaction,
      );
    });
  }

  @wrapError
  public static async assignAutomaticMissions(userId: string): Promise<void> {
    const missions =
      await MissionController.getMissionsListForAutomaticAssign();

    missions.forEach(async (mission) => {
      await MissionController.broadcastMission(mission, userId);
    });
  }
}
