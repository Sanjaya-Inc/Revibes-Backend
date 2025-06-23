import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import {
  TAddStoreBranch,
  TDeleteStoreBranch,
  TEditStoreBranch,
  TGetStoreBranch,
} from "../dto/storeBranch";
import StoreBranch, {
  BranchStoreStatus,
  TStoreBranchData,
} from "../models/StoreBranch";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class StoreBranchController {
  @wrapError
  public static async getStoreBranch({
    id,
  }: TGetStoreBranch): Promise<StoreBranch | null> {
    const querySnapshot = await db
      .collection(COLLECTION_MAP.STORE_BRANCH)
      .where("id", "==", id)
      .get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const storeBranchDoc = doc.data();
      return new StoreBranch(storeBranchDoc);
    } else {
      return null;
    }
  }

  @wrapError
  public static async getStoreBranches(): Promise<StoreBranch[]> {
    const snapshot = await db
      .collection(COLLECTION_MAP.STORE_BRANCH)
      .where("status", "==", BranchStoreStatus.ACTIVE)
      .get();
    const stores: StoreBranch[] = [];
    snapshot.forEach((doc) => {
      stores.push(new StoreBranch({ ...doc.data() }));
    });
    return stores;
  }

  @wrapError
  public static async addStoreBranch({
    name,
    country,
    address,
    postalCode,
    position,
  }: TAddStoreBranch): Promise<StoreBranch> {
    const docRef = db.collection(COLLECTION_MAP.STORE_BRANCH).doc();
    const data: TStoreBranchData = {
      id: docRef.id,
      name,
      country,
      address,
      postalCode,
      position,
      status: BranchStoreStatus.ACTIVE,
    };

    const store = new StoreBranch(data);

    await docRef.set(store.toObject());

    return store;
  }

  @wrapError
  public static async editStoreBranch({
    id,
    name,
    country,
    address,
    postalCode,
    position,
    status,
  }: TEditStoreBranch): Promise<void> {
    const storeRecord = await this.getStoreBranch({ id });
    if (!storeRecord) {
      throw new AppError(404, "STORE.NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.STORE_BRANCH).doc(id).update({
      name,
      country,
      address,
      postalCode,
      position,
      status,
    });
  }

  @wrapError
  public static async deleteStoreBranch({
    id,
  }: TDeleteStoreBranch): Promise<void> {
    // Remove file from Firebase Storage
    const store = await this.getStoreBranch({ id });

    if (!store) {
      throw new AppError(404, "STORE.NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.STORE_BRANCH).doc(id).delete();
  }
}
