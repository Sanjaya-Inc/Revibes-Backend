import COLLECTION_MAP from "../constant/db";
import { wrapError } from "../utils/decorator/wrapError";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import Mission from "../models/Mission";
import {
  TAddMission,
  TAssignMission,
  TDeleteMission,
  TGetMission,
} from "../dto/mission";
import { BasePath, db, getFileStorageInstance } from "../utils/firebase";
import AppError from "../utils/formatter/AppError";
import MissionAssignment, {
  MissionAssignmentType,
} from "../models/MissionAssignment";
import { TFirestoreData } from "../dto/common";
import { TUserMissionData, UserMissionStatus } from "../models/UserMission";
import { FieldPath } from "firebase-admin/firestore";

export type TGetMissionOpt = {
  withAssignments?: boolean;
};

export class MissionController {
  @wrapError
  public static async getMission(
    { id }: TGetMission,
    { withAssignments = false }: TGetMissionOpt = {},
  ): Promise<TFirestoreData<Mission> | null> {
    const ref = db.collection(COLLECTION_MAP.MISSION).doc(id);

    const snapshot = await ref.get();
    const missionDoc = snapshot.data();
    if (!missionDoc) {
      return null;
    }

    const data = new Mission(missionDoc);

    if (withAssignments) {
      const assignmentSnapshot = await ref
        .collection(COLLECTION_MAP.MISSION_ASSIGNMENT)
        .get();
      data.assignments = assignmentSnapshot.docs.map(
        (doc) => new MissionAssignment(doc.data()),
      );
    }

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getMissions(
    filters: TPaginateConstruct<Mission>,
  ): Promise<TPaginatedPage<Mission>> {
    const { items, pagination } = await createPage<Mission>(
      COLLECTION_MAP.MISSION,
      filters,
    );

    const missions = items.map((item) => new Mission(item));

    return {
      items: missions,
      pagination,
    };
  }

  @wrapError
  public static async getMissionsListForAutomaticAssign(): Promise<Mission[]> {
    const now = new Date();

    // Fetch missions where availableUntil is in the future (valid)
    const missionSnapshot = await db
      .collection(COLLECTION_MAP.MISSION)
      .where("availableUntil", ">", now)
      .get();

    const missions: Mission[] = [];

    for (const doc of missionSnapshot.docs) {
      const mission = new Mission(doc.data());

      // Fetch assignments with assignmentType AUTOMATIC_ENROLLMENT
      const assignmentSnapshot = await doc.ref
        .collection(COLLECTION_MAP.MISSION_ASSIGNMENT)
        .where(
          "assignmentType",
          "==",
          MissionAssignmentType.AUTOMATIC_ENROLLMENT,
        )
        .get();

      mission.assignments = assignmentSnapshot.docs.map(
        (assignmentDoc) => new MissionAssignment(assignmentDoc.data()),
      );

      if (
        mission.assignments.every(
          (a) =>
            a.assignmentType !== MissionAssignmentType.AUTOMATIC_ENROLLMENT,
        )
      ) {
        continue;
      }

      missions.push(mission);
    }

    return missions;
  }

  @wrapError
  public static async addMission({
    image,
    ...data
  }: TAddMission): Promise<Mission> {
    const docRef = db.collection(COLLECTION_MAP.MISSION).doc();
    const mission = new Mission({ ...data, id: docRef.id });

    if (image) {
      [mission.imageUri] = await getFileStorageInstance().uploadFile(
        image,
        { public: true },
        BasePath.MISSION,
        docRef.id,
      );
    }

    const batch = db.batch();
    batch.set(docRef, mission.toObject());

    await batch.commit();

    return mission;
  }

  @wrapError
  public static async assignMissions(data: TAssignMission): Promise<void> {
    const missionRes = await this.getMission({ id: data.id });
    if (!missionRes) {
      throw new AppError(404, "MISSION.NOT_FOUND");
    }
    const { data: mission, ref } = missionRes;
    data.targets = data.targets ?? [];

    const doc = ref.collection(COLLECTION_MAP.MISSION_ASSIGNMENT).doc();
    const assignment = new MissionAssignment({ ...data, id: doc.id });
    doc.set(assignment.toObject());

    if (
      [
        MissionAssignmentType.AUTOMATIC_ENROLLMENT,
        MissionAssignmentType.MANUAL_ASSIGNMENT,
      ].includes(data.assignmentType)
    ) {
      this.broadcastMission(mission, ...data.targets);
    }
  }

  @wrapError
  public static async deleteMission({ id }: TDeleteMission): Promise<void> {
    const mission = await this.getMission({ id });

    if (!mission) {
      throw new AppError(404, "MISSION.NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.MISSION).doc(id).delete();
  }

  @wrapError
  public static async broadcastMission(
    mission: Mission,
    ...targets: string[]
  ): Promise<void> {
    const userCollection = db.collection(COLLECTION_MAP.USER);
    let batch = db.batch();
    let userIdsToTarget: string[] = [];
    const MAX_BATCH_SIZE = 500; // Firestore batch limit

    console.log(`Starting broadcast for mission: ${mission.id}`);
    console.log(
      `Targeting ${targets.length > 0 ? targets.length + " specific users" : "all users"}`,
    );

    try {
      // Determine which users to target
      if (targets.length > 0) {
        // Use provided targets directly, but filter to only users with role 'user'
        if (targets.length > 0) {
          // Fetch user docs for the given target IDs and filter by role
          const targetSnapshots = await userCollection
            .where(FieldPath.documentId(), "in", targets)
            .get();
          userIdsToTarget = targetSnapshots.docs
            .filter((doc) => doc.get("role") === "user")
            .map((doc) => doc.id);
        }
      } else {
        // If no targets, fetch all user IDs
        const allUsersSnapshot = await userCollection
          .where("role", "==", "user")
          .select(FieldPath.documentId())
          .get();
        userIdsToTarget = allUsersSnapshot.docs.map((doc) => doc.id);
        console.log(
          `Found ${userIdsToTarget.length} total users for broadcast.`,
        );
      }

      if (userIdsToTarget.length === 0) {
        console.warn("No users found to broadcast the mission to. Exiting.");
        return;
      }

      let operationsCount = 0;

      for (const userId of userIdsToTarget) {
        const userMissionRef = userCollection
          .doc(userId)
          .collection(COLLECTION_MAP.USER_MISSION)
          .doc(); // Auto-ID for new doc

        // Prepare the data for the UserMission document
        const userMissionData: TUserMissionData = {
          // Assuming BaseModel handles id, createdAt, updatedAt
          id: userMissionRef.id,
          missionId: mission.id,
          type: mission.type,
          progress: 0, // Start progress at 0
          numOfTarget: mission.numOfTarget,
          createdAt: new Date(),
          status: UserMissionStatus.IN_PROGRESS,
          // Add any other default fields required by TUserMissionData if not handled by BaseModel
        };

        // Add to batch
        batch.set(userMissionRef, userMissionData); // Directly setting the plain data

        operationsCount++;

        // Commit batch if it reaches max size
        if (operationsCount % MAX_BATCH_SIZE === 0) {
          await batch.commit();
          console.log(`Committed ${operationsCount} user missions.`);
          // Create a new batch for the next set of operations
          batch = db.batch();
        }
      }

      // Commit any remaining operations in the last batch
      if (operationsCount % MAX_BATCH_SIZE !== 0 || operationsCount === 0) {
        await batch.commit();
        console.log(
          `Committed final ${operationsCount % MAX_BATCH_SIZE || operationsCount} user missions.`,
        );
      }

      console.log(
        `Successfully broadcasted mission ${mission.id} to ${operationsCount} users.`,
      );
    } catch (error) {
      console.error(`Error broadcasting mission ${mission.id}:`, error);
      throw new AppError(500, "MISSION.BROADCAST_FAILED");
    }
  }
}
