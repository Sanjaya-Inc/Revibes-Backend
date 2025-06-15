import COLLECTION_MAP from "../constant/db";
import { TRemoveBanner, TUploadBanner } from "../dto/banner";
import { BasePath, getFileStorageInstance } from "../fileStorage";
import Banner, { TBannerData } from "../models/Banner";
import db from "../utils/db";
import { wrapError } from "../utils/decorator/wrapError";

export class BannerController {
  @wrapError
  public static async getBanner(id: string): Promise<Banner | null> {
    const bannerSnapshot = await db
      .collection(COLLECTION_MAP.BANNER)
      .doc(id)
      .get();
    const bannerDoc = bannerSnapshot.data();
    if (!bannerDoc) {
      return null;
    }
    return new Banner(bannerDoc);
  }

  @wrapError
  public static async getBanners(): Promise<Banner[]> {
    const snapshot = await db.collection(COLLECTION_MAP.BANNER).get();
    const banners: Banner[] = [];
    snapshot.forEach((doc) => {
      banners.push(new Banner({ ...doc.data() }));
    });
    return banners;
  }

  @wrapError
  public static async uploadBanner({ name, image }: TUploadBanner): Promise<Banner> {

    console.log("check u 1 =======")
    const docRef = db.collection(COLLECTION_MAP.BANNER).doc();
    const [uri] = await getFileStorageInstance().uploadFile(
      image,
      { public: true },
      BasePath.BANNER,
      docRef.id,
    );
    console.log("check u 2 =======")

    const data: TBannerData = {
      id: docRef.id,
      name,
      uri,
      visible: true,
    };
    console.log("check u 3 =======")
    await docRef.set(data);

    return new Banner(data);
  }

  @wrapError
  public static async removeBanner({ id }: TRemoveBanner): Promise<void> {
    // Remove file from Firebase Storage
    const banner = await this.getBanner(id);
    if (banner) {
      await getFileStorageInstance().removeFile(banner.uri);
    }

    await db.collection(COLLECTION_MAP.BANNER).doc(id).delete();
  }
}
