import COLLECTION_MAP from "../constant/db";
import { TDeleteBanner, TGetBanner, TUploadBanner } from "../dto/banner";
import {
  BasePath,
  getFileStorageInstance,
} from "../utils/firebase/fileStorage";
import Banner, { TBannerData } from "../models/Banner";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class BannerController {
  @wrapError
  public static async getBanner({ id }: TGetBanner): Promise<Banner | null> {
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
  public static async uploadBanner({
    name,
    image,
  }: TUploadBanner): Promise<Banner> {
    if (!image) {
      throw new AppError(400, "BANNER.IMAGE_REQUIRED");
    }

    const docRef = db.collection(COLLECTION_MAP.BANNER).doc();
    const [uri] = await getFileStorageInstance().uploadFile(
      image,
      { public: true },
      BasePath.BANNER,
      docRef.id,
    );

    const data: TBannerData = {
      id: docRef.id,
      name,
      uri,
      visible: true,
    };

    const banner = new Banner(data);

    await docRef.set(banner.toObject());

    return banner;
  }

  @wrapError
  public static async deleteBanner({ id }: TDeleteBanner): Promise<void> {
    // Remove file from Firebase Storage
    const banner = await this.getBanner({ id });

    if (!banner) {
      throw new AppError(404, "BANNER.NOT_FOUND");
    }

    try {
      await getFileStorageInstance().removeFile(banner.uri);
    } catch(e) {
      console.error("delete file error", e)
    }

    await db.collection(COLLECTION_MAP.BANNER).doc(id).delete();
  }
}
