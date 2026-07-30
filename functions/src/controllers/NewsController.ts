import COLLECTION_MAP from "../constant/db";
import { TCreateNews, TUpdateNews } from "../dto/news";
import News, { TNewsData } from "../models/News";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class NewsController {
  @wrapError
  public static async getDailyNews(): Promise<News | null> {
    const snapshot = await db
      .collection(COLLECTION_MAP.NEWS)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return new News({ ...snapshot.docs[0].data() });
    }

    const latestSnapshot = await db
      .collection(COLLECTION_MAP.NEWS)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (!latestSnapshot.empty) {
      return new News({ ...latestSnapshot.docs[0].data() });
    }

    return null;
  }

  @wrapError
  public static async createNews({
    title,
    content,
  }: TCreateNews): Promise<News> {
    const batch = db.batch();

    const activeSnapshot = await db
      .collection(COLLECTION_MAP.NEWS)
      .where("isActive", "==", true)
      .get();

    activeSnapshot.forEach((doc) => {
      batch.update(doc.ref, { isActive: false });
    });

    const docRef = db.collection(COLLECTION_MAP.NEWS).doc();
    const data: TNewsData = {
      id: docRef.id,
      title,
      content,
      createdAt: new Date(),
      isActive: true,
    };

    const news = new News(data);
    batch.set(docRef, news.toObject());

    await batch.commit();

    return news;
  }

  @wrapError
  public static async updateNews(
    id: string,
    updateData: TUpdateNews,
  ): Promise<News> {
    const docRef = db.collection(COLLECTION_MAP.NEWS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError(404, "NEWS.NOT_FOUND");
    }

    const currentData = doc.data() as TNewsData;
    const updatedFields: Partial<TNewsData> = {};
    if (updateData.title !== undefined) updatedFields.title = updateData.title;
    if (updateData.content !== undefined)
      updatedFields.content = updateData.content;

    await docRef.update(updatedFields);

    return new News({ ...currentData, ...updatedFields });
  }

  @wrapError
  public static async deleteNews(id: string): Promise<boolean> {
    const docRef = db.collection(COLLECTION_MAP.NEWS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError(404, "NEWS.NOT_FOUND");
    }

    await docRef.delete();
    return true;
  }
}
