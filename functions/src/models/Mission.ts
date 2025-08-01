import BaseModel from "./BaseModel";
import MissionAssignment from "./MissionAssignment";

export enum MissionType {
  USER_PROFILE_FULLFILL = "user-profile-fullfill",
  LOGISTIC_ORDER_SUBMIT = "logistic-order-submit",
  LOGISTIC_ORDER_COMPLETE = "logistic-order-complete",
}

export type TMissionData = Partial<Mission>;

export const detailFields: (keyof Mission)[] = [
  "id",
  "type",
  "title",
  "subtitle",
  "description",
  "imageUri",
  "reward",
  "numOfTarget",
  "createdAt",
  "updatedAt",
  "availableUntil",
];

export const publicFields: (keyof Mission)[] = [
  "id",
  "type",
  "title",
  "subtitle",
  "imageUri",
  "reward",
  "numOfTarget",
  "createdAt",
  "updatedAt",
  "availableUntil",
];

export const defaultMissionData: TMissionData = {
  id: "",
  type: MissionType.LOGISTIC_ORDER_COMPLETE,
  title: "",
  subtitle: "",
  description: "",
  imageUri: "",
  reward: 0,
  numOfTarget: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  availableUntil: null,

  assignments: [],
};

export class Mission extends BaseModel {
  id!: string;
  imageUri!: string;
  type!: MissionType;
  title!: string;
  subtitle?: string;
  description?: string;
  reward!: number;
  numOfTarget!: number;
  createdAt!: Date;
  updatedAt!: Date;
  availableUntil!: Date | null;

  // relations
  assignments!: MissionAssignment[];

  constructor(data: TMissionData) {
    super(data, defaultMissionData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }
}

export default Mission;
