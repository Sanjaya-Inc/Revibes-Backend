import BaseModel from "./BaseModel";
import { TMedia } from "./LogisticItem";

export type TInventoryItemData = Partial<InventoryItem>;

export const publicFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "imageUrl",
  "stock",
  "isActive",
];

export const detailFields: (keyof InventoryItem)[] = [
  "id",
  "createdAt",
  "updatedAt",
  "name",
  "description",
  "imageUrl",
  "media",
  "stock",
  "isActive",
];

export const defaultInventoryItemData: TInventoryItemData = {
  id: "",
  name: "",
  description: "",
  imageUrl: "",
  media: [],
  stock: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export class InventoryItem extends BaseModel {
  id!: string;
  name!: string;
  description?: string;
  imageUrl?: string;
  media!: TMedia[];
  stock!: number;
  isActive!: boolean;
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
