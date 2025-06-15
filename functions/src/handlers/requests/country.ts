import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import { CountryController } from "../../controllers/CountryController";
import Country from "../../models/Country";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { requireApiKey } from "../../middlewares/auth";
import { AddCountrySchema, TAddCountry } from "../../dto/country";
import AppError from "../../utils/formatter/AppError";

export const countryRoutes = new Routes("countries");

export class CountryHandlers {
  @registerRoute(countryRoutes, "get", "")
  static async getCountries(req: Request, res: Response) {
    const response = await CountryController.getCountries();
    new AppResponse<Country[]>({
      code: 200,
      message: "COUNTRY.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(countryRoutes, "post", "", requireApiKey)
  static async addCountries(req: Request, res: Response) {
    const data: TAddCountry = req.body;

    try {
      AddCountrySchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }
    
    const response = await CountryController.addCountry(data);
    new AppResponse<Country>({
      code: 201,
      message: "COUNTRY.ADDED_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
