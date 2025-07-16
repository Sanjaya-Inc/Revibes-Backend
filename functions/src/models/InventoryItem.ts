import BaseModel from "./BaseModel";
import { TMedia } from "./LogisticItem";

export type TInventoryItemData = Partial<InventoryItem>;

export const publicFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "featuredimageUri",
  "stock",
  "isAvailable",
];

export const detailFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "description",
  "featuredimageUri",
  "media",
  "stock",
  "isAvailable",
];

export const defaultInventoryItemData: TInventoryItemData = {
  id: "",
  name: "",
  description: "",
  featuredimageUri: "",
  media: [],
  stock: 0,
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class InventoryItem extends BaseModel {
  id!: string;
  name!: string;
  description?: string;
  featuredimageUri?: string;
  media!: TMedia[];
  stock!: number;
  isAvailable!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: TInventoryItemData) {
    super(data, defaultInventoryItemData);
  }

  getPublicFields(keys = publicFields) {
    return super.pickFields(keys);
  }

  getDetailFields(keys = detailFields) {
    return super.pickFields(keys);
  }
}

export default InventoryItem;
