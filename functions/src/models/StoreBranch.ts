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

export const defaultStoreBranchData: TStoreBranchData = {
  id: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  name: "",
  country: "",
  address: "",
  postalCode: "",
  position: null,
  status: BranchStoreStatus.ACTIVE,
};

export class StoreBranch extends BaseModel {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  country!: string;
  address!: string;
  postalCode!: string;
  position?: TPosition | null;
  status!: BranchStoreStatus;

  constructor(data: TStoreBranchData) {
    super(data, defaultStoreBranchData);
  }
}

export default StoreBranch;
