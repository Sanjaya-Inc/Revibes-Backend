import BaseModel from "./BaseModel";

export enum MissionAssignmentType {
  // Original description: "user who is already signup and signup in the future will assigned to this mission"
  // New Name: AUTOMATIC_ENROLLMENT (or AUTO_ASSIGN, IMMEDIATE_ASSIGN depending on specific nuance)
  // I'll go with AUTOMATIC_ENROLLMENT as it's a good general fit for auto-assignment based on criteria.
  AUTOMATIC_ENROLLMENT = "automatic-enrollment",

  // Original description: "user who is already signup will assigned to this mission"
  // New Name: MANUAL_ASSIGNMENT (or ADMIN_ASSIGNMENT if exclusively by admin/system)
  // MANUAL_ASSIGNMENT is a broader term for non-automatic, which fits "direct push" from a system/admin.
  MANUAL_ASSIGNMENT = "manual-assignment",

  // Original description: "user need to request to this mission to be assigned"
  // New Name: OPT_IN_REQUEST (or USER_REQUEST from your original)
  // OPT_IN_REQUEST is more explicit about the user's active choice.
  OPT_IN_REQUEST = "opt-in-request",
}

export type TMissionData = Partial<MissionAssignment>;

export const defaultMissionData: TMissionData = {
  id: "",
  assignmentType: MissionAssignmentType.MANUAL_ASSIGNMENT,
  createdAt: new Date(),
};

export class MissionAssignment extends BaseModel {
  id!: string;
  target?: string;
  assignmentType!: MissionAssignmentType;
  createdAt!: Date;

  constructor(data: TMissionData) {
    super(data, defaultMissionData);
  }
}

export default MissionAssignment;
