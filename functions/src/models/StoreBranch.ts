import { TPosition } from "../dto/position";
import BaseModel from "./BaseModel";

export type TStoreBranchData = Partial<StoreBranch>;

export enum BranchStoreStatus {
  ACTIVE = "active",
  TEMPORARILY_CLOSED = "temporarily-closed",
  PERMANENTLY_CLOSED = "permanently-closed",
  UNDER_MAINTENANCE = "under-maintenance",
  COMING_SOON = "coming-soon",
}

export class StoreBranch extends BaseModel {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  country!: string;
  address!: string;
  postalCode!: string;
  position?: TPosition;
  status!: BranchStoreStatus;

  constructor(data: TStoreBranchData) {
    super();

    Object.assign(this, { ...data });
  }
}

export default StoreBranch;
