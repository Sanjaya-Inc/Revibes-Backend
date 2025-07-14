import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import {
  TAddStoreBranch,
  TDeleteStoreBranch,
  TEditStoreBranch,
  TGetStoreBranch,
  TGetStoreBranches,
} from "../dto/storeBranch";
import StoreBranch, {
  BranchStoreStatus,
  TStoreBranchData,
} from "../models/StoreBranch";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";
import { haversineDistance } from "../utils/geolocation";

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
  public static async getStoreBranches(
    filters: TGetStoreBranches,
  ): Promise<StoreBranch[]> {
    const { limit, latitude, longitude } = filters;

    const snapshot = await db
      .collection(COLLECTION_MAP.STORE_BRANCH)
      .where("status", "==", BranchStoreStatus.ACTIVE)
      .get();

    let stores: StoreBranch[] = [];
    snapshot.forEach((doc) => {
      stores.push(new StoreBranch({ ...doc.data() }));
    });

    if (typeof latitude === "number" && typeof longitude === "number") {
      stores.forEach((store) => {
        if (
          typeof store.position?.latitude === "number" &&
          typeof store.position?.longitude === "number"
        ) {
          store.position.distance = haversineDistance(
            latitude,
            longitude,
            store.position.latitude,
            store.position.longitude,
          );
        }
      });

      stores = stores.sort((a, b) => {
        const distA = a.position?.distance ?? Infinity;
        const distB = b.position?.distance ?? Infinity;
        return distA - distB;
      });
    }

    if (limit) {
      stores = stores.slice(0, limit);
    }

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
