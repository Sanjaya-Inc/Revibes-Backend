import COLLECTION_MAP from "../constant/db";
import { db } from "../utils/firebase";
import Country from "../models/Country";
import {
  TAddCountry,
  TDeleteCountry,
  TEditCountry,
  TGetCountry,
} from "../dto/country";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class CountryController {
  @wrapError
  public static async getCountries(): Promise<Country[]> {
    const snapshot = await db
      .collection(COLLECTION_MAP.COUNTRY)
      .where("visible", "==", true)
      .get();
    const countries: Country[] = [];
    snapshot.forEach((doc) => {
      countries.push(new Country(doc.data()));
    });
    return countries;
  }

  @wrapError
  public static async getCountry({
    code,
  }: TGetCountry): Promise<Country | null> {
    const querySnapshot = await db
      .collection(COLLECTION_MAP.COUNTRY)
      .where("code", "==", code)
      .get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const countryDoc = doc.data();
      return new Country(countryDoc);
    } else {
      return null;
    }
  }

  @wrapError
  public static async addCountry(data: TAddCountry): Promise<Country> {
    const countryRecord = await this.getCountry({ code: data.code });
    if (countryRecord) {
      throw new AppError(400, "COUNTRY.CODE_EXIST");
    }

    const country = new Country(data);

    await db
      .collection(COLLECTION_MAP.COUNTRY)
      .doc(data.code)
      .set(country.toObject());

    return country;
  }

  @wrapError
  public static async editCountry(data: TEditCountry): Promise<void> {
    const countryRecord = await this.getCountry({ code: data.code });
    if (!countryRecord) {
      throw new AppError(404, "COUNTRY.NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.COUNTRY).doc(data.code).update(data);
  }

  @wrapError
  public static async deleteCountry({ code }: TDeleteCountry): Promise<void> {
    // Remove file from Firebase Storage
    const country = await this.getCountry({ code });

    if (!country) {
      throw new AppError(404, "COUNTRY.NOT_FOUND");
    }

    await db.collection(COLLECTION_MAP.COUNTRY).doc(code).delete();
  }
}
