import { ChangePasswordSchema, TChangePassword } from "../../dto/me";
import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { MeController } from "../../controllers/MeController";
import { PaginationSchema, TPagination } from "../../dto/pagination";
import {
  RemoveUserDeviceSchema,
  SaveUserDeviceSchema,
  TRemoveUserDevice,
  TSaveUserDevice,
} from "../../dto/userDevice";
import { UserDeviceController } from "../../controllers/UserDeviceController";
import { UserDailyRewardController } from "../../controllers/UserDailyRewardController";
import { UserVoucherController } from "../../controllers/UserVoucherController";
import { UserPointController } from "../../controllers/UserPointController";
import { UserMissionController } from "../../controllers/UserMissionController";
import {
  ClaimMissionSchema,
  GetMissionsSchema,
  TClaimMission,
  TGetMissions,
} from "../../dto/userMission";
import { getFileStorageInstance } from "../../utils/firebase";

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

    const response = await UserDailyRewardController.getDailyRewards(req.user);
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

    await UserDailyRewardController.claimDailyRewards(req.user);
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

    const response = await UserVoucherController.getVouchers(
      req.user,
      pagination,
      { withMetadata: true },
    );

    response.items = response.items.map((i) => i.getPublicFields());

    new AppResponse({
      code: 200,
      message: "ME.FETCH_VOUCHER_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "get", "devices", authenticate)
  static async getDevices(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await UserDeviceController.getDevices(req.user);
    new AppResponse({
      code: 200,
      message: "ME.FETCH_DEVICE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "put", "devices", authenticate)
  static async saveDevice(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const userAgent: string =
      req.get("User-Agent") || req.get("user-agent") || "";
    let data: TSaveUserDevice = { ...req.body, userAgent };

    try {
      // Validate form data using Zod
      data = SaveUserDeviceSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserDeviceController.saveDevice(req.user, data);
    new AppResponse({
      code: 200,
      message: "ME.ADD_DEVICE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "delete", "devices/:id", authenticate)
  static async deleteDevice(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TRemoveUserDevice = { id };

    try {
      // Validate form data using Zod
      data = RemoveUserDeviceSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserDeviceController.removeDevice(req.user, data);
    new AppResponse({
      code: 200,
      message: "ME.DELETE_DEVICE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "get", "missions", authenticate)
  static async getMissions(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let filters: TGetMissions;
    try {
      filters = GetMissionsSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserMissionController.getMissions(
      req.user,
      filters,
      { withMission: true },
    );
    await Promise.all(
      response.items.map(async (i) => {
        if (i.mission) {
          i.mission.imageUri = await getFileStorageInstance().getFullUrl(
            i.mission.imageUri,
          );
        }

        return i;
      }),
    );

    new AppResponse({
      code: 200,
      message: "ME.FETCH_MISSIONS_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "patch", "missions/:id", authenticate)
  static async claimMissionReward(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TClaimMission = { id };

    try {
      // Validate form data using Zod
      data = ClaimMissionSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserMissionController.claimMissions(req.user, data);
    new AppResponse({
      code: 200,
      message: "ME.CLAIM_MISSION_REWARD_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(meRoutes, "get", "points/histories", authenticate)
  static async getPointHistories(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let pagination: TPagination;
    try {
      pagination = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserPointController.getHistories(
      req.user,
      pagination,
    );

    response.items = response.items.map((i) => i.getPublicFields());

    new AppResponse({
      code: 200,
      message: "ME.FETCH_POINT_HISTORIES_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
