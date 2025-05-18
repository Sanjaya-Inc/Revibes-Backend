import BaseModel from "./BaseModel";

export interface IUserData {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  points?: number;
  lastClaimedDate?: Date | null;
}

export class User extends BaseModel {
  uid?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  points?: number;
  lastClaimedDate?: Date | null;

  constructor(data: IUserData) {
    super();
    Object.assign(this, data);
  }
}

export default User;
