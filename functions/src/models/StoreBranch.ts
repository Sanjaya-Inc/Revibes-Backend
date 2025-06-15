import BaseModel from "./BaseModel";

export type TStoreBranchData = Partial<StoreBranch>;

export class StoreBranch extends BaseModel {
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;
  name!: string;
  country!: string;
  address!: string;
  postalCode!: string;
  status!: string;

  constructor(data: TStoreBranchData) {
    super();

    Object.assign(this, { ...data });
  }
}

export default StoreBranch;
