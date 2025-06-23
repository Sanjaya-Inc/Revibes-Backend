import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import { BannerController } from "../../controllers/BannerController";
import {
  DeleteBannerSchema,
  TDeleteBanner,
  TUploadBanner,
  UploadedBannerSchema,
} from "../../dto/banner";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { parseFormData } from "../../utils/formatter/formData";

export const bannerRoutes = new Routes("banners");

export class BannerHandlers {
  @registerRoute(bannerRoutes, "get", "", authenticate)
  static async getBanners(req: Request, res: Response) {
    const response = await BannerController.getBanners();
    new AppResponse({
      code: 200,
      message: "BANNER.FETCH_SUCCESS",
      data: response.map((r) => r.pickFields()),
    }).asJsonResponse(res);
  }

  @registerRoute(bannerRoutes, "post", "", authenticate, adminOnly)
  static async uploadBanner(req: Request, res: Response) {
    const data = parseFormData<TUploadBanner>(req);

    try {
      // Validate form data using Zod
      UploadedBannerSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await BannerController.uploadBanner(data);
    new AppResponse({
      code: 201,
      message: "BANNER.UPLOAD_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(bannerRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteBanner(req: Request, res: Response) {
    const id = req.params.id;
    const data: TDeleteBanner = { id };

    try {
      // Validate form data using Zod
      DeleteBannerSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await BannerController.deleteBanner(data);
    new AppResponse({
      code: 200,
      message: "BANNER.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
