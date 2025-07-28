import BaseModel from "./BaseModel";
import Mission from "./Mission";
import { MissionType } from "./MissionAssignment";

export type TUserMissionData = Partial<UserMission>;

export enum UserMissionStatus {
  IN_PROGRESS = "in_progress",
  AVAILABLE = "available",
  CLAIMED = "claimed",
  EXPIRED = "expired",
}

export const defaultUserMissionData: TUserMissionData = {
  id: "",
  type: MissionType.LOGISTIC_ORDER_COMPLETE,
  missionId: "",
  progress: 0,
  numOfTarget: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  status: UserMissionStatus.IN_PROGRESS,
};

export class UserMission extends BaseModel {
  id!: string;
  type!: MissionType;
  missionId!: string;
  progress!: number;
  numOfTarget!: number;
  createdAt!: Date;
  updatedAt!: Date;
  status!: UserMissionStatus;

  // relations
  mission?: Mission;

  constructor(data: TUserMissionData) {
    super(data, defaultUserMissionData);
  }

  isAvailable(): boolean {
    if (this.status !== UserMissionStatus.AVAILABLE) {
      return false;
    }

    return true;
  }

  isClaimable(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    return this.progress >= this.numOfTarget;
  }

  addProgress(progress = 1) {
    this.progress += progress;
    if (this.progress > this.numOfTarget) {
      this.progress = this.numOfTarget;
    }

    if (this.progress === this.numOfTarget) {
      this.status = UserMissionStatus.AVAILABLE;
    }
  }
}

export default UserMission;
