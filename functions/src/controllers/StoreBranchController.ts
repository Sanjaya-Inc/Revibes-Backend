import COLLECTION_MAP from "../constant/db";
import db from "../utils/db";
import { TGetStoreBranch } from "../dto/storeBranch";
import StoreBranch from "../models/StoreBranch";
import { wrapError } from "../utils/decorator/wrapError";

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
}
