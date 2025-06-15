import { UserRole } from "../models/User";

export type TUserMetadata = {
  id?: string;
  displayName?: string;
  points?: number;
  lastClaimedDate?: Date | null;
  role?: UserRole;
};

export type TCreateUser = {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  password?: string;
  role?: UserRole;
};

export type TGetUserByEmail = {
  email: string;
};
