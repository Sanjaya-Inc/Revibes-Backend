import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import { CountryController } from "../../controllers/CountryController";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import {
  AddCountrySchema,
  DeleteCountrySchema,
  EditCountrySchema,
  TAddCountry,
  TDeleteCountry,
  TEditCountry,
} from "../../dto/country";
import AppError from "../../utils/formatter/AppError";

export const countryRoutes = new Routes("countries");

export class CountryHandlers {
  @registerRoute(countryRoutes, "get", "", authenticate)
  static async getCountries(req: Request, res: Response) {
    const response = await CountryController.getCountries();
    new AppResponse({
      code: 200,
      message: "COUNTRY.FETCH_SUCCESS",
      data: response.map((r) => r.pickFields()),
    }).asJsonResponse(res);
  }

  @registerRoute(countryRoutes, "post", "", authenticate, adminOnly)
  static async addCountries(req: Request, res: Response) {
    const data: TAddCountry = req.body;

    try {
      AddCountrySchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await CountryController.addCountry(data);
    new AppResponse({
      code: 201,
      message: "COUNTRY.ADD_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(countryRoutes, "put", ":code", authenticate, adminOnly)
  static async editCountries(req: Request, res: Response) {
    const code = req.params.code;
    const data: TEditCountry = { ...req.body, code };

    try {
      EditCountrySchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await CountryController.editCountry(data);
    new AppResponse({
      code: 200,
      message: "COUNTRY.EDIT_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(countryRoutes, "delete", ":code", authenticate, adminOnly)
  static async deleteCountry(req: Request, res: Response) {
    const code = req.params.code;
    const data: TDeleteCountry = { code };

    try {
      // Validate form data using Zod
      DeleteCountrySchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await CountryController.deleteCountry(data);
    new AppResponse({
      code: 200,
      message: "COUNTRY.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
