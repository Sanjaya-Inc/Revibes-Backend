import COLLECTION_MAP from "../constant/db";
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
  TDeleteInventoryItem,
  TGetInventoryItem,
  TGetInventoryItemRes,
} from "../dto/inventoryItem";
import {
  createPage,
  TPaginateConstruct,
  TPaginatedPage,
} from "../utils/pagination";
import { UserRole } from "../models/User";
import { TGetUserRes } from "../dto/user";
import { getDocsByIds } from "../utils/firestoreCommonQuery";
import { Transaction } from "firebase-admin/firestore";

export class InventoryItemController {
  @wrapError
  public static async getItem(
    user: TGetUserRes,
    { id }: TGetInventoryItem,
  ): Promise<TGetInventoryItemRes | null> {
    const ref = db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc(id);
    const snapshot = await ref.get();
    const doc = snapshot.data();
    if (!doc) {
      return null;
    }
    const data = new InventoryItem(doc);

    if (user.data.role === UserRole.USER && !data.isAvailable) {
      throw new AppError(404, "INVENTORY.ITEM_NOT_FOUND");
    }

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async getItems(
    user: TGetUserRes,
    filters: TPaginateConstruct<InventoryItem>,
  ): Promise<TPaginatedPage<InventoryItem>> {
    filters.construct = InventoryItem;
    if (user.data.role === UserRole.USER) {
      filters.addQuery = (q) => q.where("isAvailable", "==", true);
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
      featuredimageUri: uri,
      stock: stock,
    };

    const item = new InventoryItem(data);
    await docRef.set(item.toObject());

    return item;
  }

  @wrapError
  public static async deleteItem(
    user: TGetUserRes,
    { id }: TDeleteInventoryItem,
  ): Promise<void> {
    const item = await this.getItem(user, { id });

    if (!item) {
      throw new AppError(404, "INVENTORY.ITEM_NOT_FOUND");
    }

    if (item.data.featuredimageUri) {
      await getFileStorageInstance().removeFile(item.data.featuredimageUri);
    }

    await db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc(id).delete();
  }

  @wrapError
  public static async getAvailableItemByIds(
    ids: string[],
  ): Promise<InventoryItem[]> {
    return getDocsByIds<InventoryItem>(COLLECTION_MAP.INVENTORY_ITEM, ids, {
      addQuery: (q) => q.where("isAvailable", "==", true),
      construct: InventoryItem,
    });
  }

  @wrapError
  public static async txGetItem(
    id: string,
    tx: Transaction,
  ): Promise<TGetInventoryItemRes> {
    const ref = db.collection(COLLECTION_MAP.INVENTORY_ITEM).doc(id);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) {
      throw new AppError(404, "INVENTORY.ITEM_NOT_FOUND");
    }
    const data = new InventoryItem({ ...snapshot.data() });

    return {
      data,
      ref,
      snapshot,
    };
  }

  @wrapError
  public static async txUpdateStock(
    item: TGetInventoryItemRes,
    qty: number,
    tx: Transaction,
  ): Promise<void> {
    if (!item.data.hasRequestedStock(qty)) {
      throw new AppError(400, "INVENTORY.ITEM_OUT_OF_STOCK");
    }
    tx.update(item.ref, { stock: item.data.decrease(qty) });
  }
}
