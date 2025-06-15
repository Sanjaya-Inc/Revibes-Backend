import COLLECTION_MAP from "../constant/db";
import db from "../utils/db";
import Country from "../models/Country";
import { TAddCountry } from "../dto/country";
import { wrapError } from "../utils/decorator/wrapError";
import AppError from "../utils/formatter/AppError";

export class CountryController {
  @wrapError
  public static async getCountries(): Promise<Country[]> {
    const snapshot = await db.collection(COLLECTION_MAP.COUNTRY).where("visible", "==", true).get();
    const countries: Country[] = [];
    snapshot.forEach((doc) => {
      countries.push(new Country({ ...doc.data() }));
    });
    return countries;
  }

  @wrapError
  public static async getCountry(code: string): Promise<Country | null> {
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
    const countryRecord = await this.getCountry(data.code);
    if (countryRecord) {
      throw new AppError(400, "COUNTRY.CODE_EXIST")
    }

    await db.collection(COLLECTION_MAP.COUNTRY).doc(data.code).set(data);

    return new Country(data);
  }
}
