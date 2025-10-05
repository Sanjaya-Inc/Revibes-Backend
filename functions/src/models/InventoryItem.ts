import BaseModel from "./BaseModel";
import { TMedia } from "./LogisticItem";

export type TInventoryItemData = Partial<InventoryItem>;

export const metadataFields: (keyof InventoryItem)[] = [
  "id",
  "name",
  "description",
  "featuredImageUri",
  "media",
];

export const publicFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "featuredImageUri",
  "stock",
  "isAvailable",
];

export const detailFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "description",
  "featuredImageUri",
  "media",
  "stock",
  "isAvailable",
];

export const defaultInventoryItemData: TInventoryItemData = {
  id: "",
  name: "",
  description: "",
  featuredImageUri: "",
  media: [],
  stock: 0,
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  inUse: false,
};

export class InventoryItem extends BaseModel {
  id!: string;
  name!: string;
  description?: string;
  featuredImageUri?: string;
  media!: TMedia[];
  stock!: number;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  inUse!: boolean;

  constructor(data: TInventoryItemData) {
    super(data, defaultInventoryItemData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }

  getMetadataFields(keys = metadataFields) {
    return super.pickFields(keys);
  }

  isUnlimited(): boolean {
    return this.stock === -1;
  }

  hasRequestedStock(value: number): boolean {
    if (!this.isUnlimited() && value === -1) return false;
    return this.isUnlimited() ? true : this.stock >= value;
  }

  decrease(value: number): number {
    if (!this.isUnlimited()) {
      this.stock -= value;
    }

    return this.stock;
  }
}

export default InventoryItem;
