import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import { wrapError } from "../utils/decorator/wrapError";
import AppSetting, { defaultSetting, TAppSettingData } from "../models/AppSetting";
import { TUpdateAppSetting } from "../dto/appSetting";

export class AppSettingController {
  private static _setting: AppSetting;
  
  @wrapError
  public static async getSetting(): Promise<AppSetting> {
    if (!this._setting) {
      const querySnapshot = await db
        .collection(COLLECTION_MAP.APP_SETTING)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const settingDoc = doc.data();
        
        this._setting = new AppSetting(settingDoc);
      }
    } else {
      this._setting = new AppSetting(defaultSetting.toObject());
      // Save the default setting to Firestore
      await db.collection(COLLECTION_MAP.APP_SETTING).add(this._setting.toObject());
    }

    return this._setting;
  }

  @wrapError
  public static async updateSetting(data: TUpdateAppSetting): Promise<AppSetting> {
    if (!this._setting) {
      await this.getSetting();
    }

    Object.keys(data).forEach((key) => {
      const newValue = (data as any)[key];
      if (newValue !== undefined) {
        (this._setting as any)[key] = newValue;
      }
    });

    // Update in Firestore
    const querySnapshot = await db
      .collection(COLLECTION_MAP.APP_SETTING)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await docRef.update(this._setting.toObject());
    }

    return this._setting;
  }
}