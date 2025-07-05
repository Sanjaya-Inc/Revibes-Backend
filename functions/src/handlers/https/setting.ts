import { AppSettingController } from '../../controllers/AppSettingController';
import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { TUpdateAppSetting, UpdateAppSettingSchema } from '../../dto/appSetting';

export const settingRoutes = new Routes("setting");

export class SettingHandlers {
  @registerRoute(settingRoutes, "get", "app", authenticate, adminOnly)
  static async getAppSetting(req: Request, res: Response) {
    const response = await AppSettingController.getSetting();
    new AppResponse({
      code: 200,
      message: "SETTING.FETCH_APP_SUCCESS",
      data: response.toObject(),
    }).asJsonResponse(res);
  }

  @registerRoute(settingRoutes, "put", "app", authenticate, adminOnly)
  static async updateAppSetting(req: Request, res: Response) {
    let data: TUpdateAppSetting = req.body;

    try {
      data = UpdateAppSettingSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await AppSettingController.updateSetting(data);
    new AppResponse({
      code: 200,
      message: "SETTING.UPDATE_APP_SUCCESS",
    }).asJsonResponse(res);
  }
}
