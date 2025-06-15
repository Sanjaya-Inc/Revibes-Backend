import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Banner from "../../models/Banner";
import { BannerController } from "../../controllers/BannerController";
import { UploadedBannerSchema } from "../../dto/banner";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { requireApiKey } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";

export const bannerRoutes = new Routes("banners");

export class BannerHandlers {
  @registerRoute(bannerRoutes, "get")
  static async getBanners(req: Request, res: Response) {
    const response = await BannerController.getBanners();
    new AppResponse<Banner[]>({
      code: 200,
      message: "BANNER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(bannerRoutes, "post", "", requireApiKey)
  static async uploadBanner(req: Request, res: Response) {
    // Combine req.body and req.files if available, otherwise just use req.body
    const data = {
      ...req.body,
      files: (req as any).files || undefined,
    };

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
      data: response,
    }).asJsonResponse(res);
  }
}
