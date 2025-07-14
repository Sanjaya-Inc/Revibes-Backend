import COLLECTION_MAP from "../constant/db";
import { TDeleteBanner } from "../dto/banner";
import {
  BasePath,
  getFileStorageInstance,
} from "../utils/firebase/fileStorage";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import InventoryItem, { TInventoryItemData } from "../models/InventoryItem";
import {
  TAddInventoryItem,
  TGetInventoryItem,
  TGetInventoryItemRes,
} from "../dto/inventoryItem";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import User, { UserRole } from "../models/User";

export class InventoryItemController {
  @wrapError
  public static async getItem({
    id,
  }: TGetInventoryItem): Promise<TGetInventoryItemRes | null> {
    const ref = db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc(id);
    const snapshot = await ref.get();
    const doc = snapshot.data();
    if (!doc) {
      return null;
    }
    const data = new InventoryItem(doc);

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getItems(
    user: User,
    filters: TPaginateConstruct<InventoryItem>,
  ): Promise<TPaginatedPage<InventoryItem>> {
    if (user.role === UserRole.USER) {
      filters.addQuery = (q) => q.where("isActive", "==", true);
    }

    return await createPage<InventoryItem>(
      COLLECTION_MAP.INVENTORY_ITEM,
      filters,
    );
  }

  @wrapError
  public static async addItem({
    name,
    description,
    stock,
    image,
  }: TAddInventoryItem): Promise<InventoryItem> {
    const docRef = db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc();

    let uri = "";
    if (image) {
      [uri] = await getFileStorageInstance().uploadFile(
        image,
        { public: true },
        BasePath.INVENTORY_ITEM,
        docRef.id,
      );
    }

    const data: TInventoryItemData = {
      id: docRef.id,
      name: name,
      description: description,
      imageUrl: uri,
      stock: stock,
    };

    const item = new InventoryItem(data);
    await docRef.set(item.toObject());

    return item;
  }

  @wrapError
  public static async deleteItem({ id }: TDeleteBanner): Promise<void> {
    const item = await this.getItem({ id });

    if (!item) {
      throw new AppError(404, "INVENTORY_ITEM.NOT_FOUND");
    }

    if (item.data.imageUrl) {
      await getFileStorageInstance().removeFile(item.data.imageUrl);
    }

    await db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc(id).delete();
  }
}
