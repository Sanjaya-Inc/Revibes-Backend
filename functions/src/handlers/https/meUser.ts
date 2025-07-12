import { ChangePasswordSchema, TChangePassword } from "../../dto/me";
import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { MeController } from "../../controllers/MeController";
import { PaginationSchema, TPagination } from "../../dto/pagination";

export const meRoutes = new Routes("me");

export class MeHandlers {
  @registerRoute(meRoutes, "get", "profile", authenticate)
  static async getProfile(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await MeController.getProfile(req.user.data);
    new AppResponse({
      code: 200,
      message: "ME.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "patch", "password", authenticate)
  static async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data: TChangePassword = req.body;
    try {
      data = ChangePasswordSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await MeController.changePassword(req.user.data, data);

    new AppResponse({
      code: 200,
      message: "ME.UPDATE_PASS_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "get", "daily-rewards", authenticate)
  static async getDailyRewards(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await MeController.getDailyRewards(req.user);
    new AppResponse({
      code: 200,
      message: "ME.FETCH_DAILY_REWARD_SUCCESS",
      data: response.map((r) => r.pickFields()),
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "patch", "daily-rewards", authenticate)
  static async claimDailyRewards(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await MeController.claimDailyRewards(req.user);
    new AppResponse({
      code: 200,
      message: "ME.CLAIM_DAILY_REWARD_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "get", "vouchers", authenticate)
  static async getVouchers(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let pagination: TPagination;
    try {
      pagination = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await MeController.getVouchers(req.user, pagination);
    new AppResponse({
      code: 200,
      message: "ME.FETCH_VOUCHER_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
