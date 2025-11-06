import {
  ChangeUserStatusSchema,
  CreateUserSchema,
  GetUserSchema,
  TChangeUserStatus,
  TCreateUser,
  TGetUser,
  TAddUserPoint,
  AddUserPointSchema,
  TGetUserVouchers,
  GetUserVouchersSchema,
  TUseUserVoucher,
  UseUserVoucherSchema,
  TEditUser,
  EditUserSchema,
  TVerifyUser,
  VerifyUserSchema,
} from "../../dto/user";
import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { UserController } from "../../controllers/UserController";
import { PaginationSchema, TPagination } from "../../dto/pagination";
import { getFileStorageInstance } from "../../utils/firebase";

export const userRoutes = new Routes("users");

export class UserHandlers {
  @registerRoute(userRoutes, "get", "", authenticate, adminOnly)
  static async getUsers(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let pagination: TPagination;
    try {
      pagination = PaginationSchema.parse(req.query);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserController.getUsers(pagination);
    response.items = response.items.map((i) => i.getPublicFields());

    new AppResponse({
      code: 200,
      message: "USER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "get", ":id", authenticate, adminOnly)
  static async getUser(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetUser = { id };
    try {
      data = GetUserSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserController.getUser(data);
    if (!response) {
      throw new AppError(404, "USER.NOT_FOUND");
    }

    new AppResponse({
      code: 200,
      message: "USER.FETCH_SUCCESS",
      data: response.data.getDetailFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "post", "", authenticate, adminOnly)
  static async createUser(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    let data: TCreateUser = req.body;
    try {
      data = CreateUserSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserController.createUser(data);
    response.getDetailFields();

    new AppResponse({
      code: 201,
      message: "USER.CREATE_SUCCESS",
      data: response.getDetailFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "put", ":id", authenticate, adminOnly)
  static async updateUser(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TEditUser = { id, ...req.body };
    try {
      data = EditUserSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await UserController.editUser(data);

    new AppResponse({
      code: 200,
      message: "USER.UPDATE_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "patch", ":id/status", authenticate, adminOnly)
  static async changeUserStatus(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TChangeUserStatus = { id, ...req.body };
    try {
      data = ChangeUserStatusSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await UserController.changeUserStatus(data);

    new AppResponse({
      code: 200,
      message: "USER.PATCH_STATUS_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "patch", ":id/verify", authenticate, adminOnly)
  static async VerifyUser(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TVerifyUser = { id, ...req.body };
    try {
      data = VerifyUserSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await UserController.verifyUser(data);

    new AppResponse({
      code: 200,
      message: "USER.VERIFY_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "patch", ":id/points/add", authenticate, adminOnly)
  static async addUserPoint(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TAddUserPoint = { id, ...req.body };
    try {
      data = AddUserPointSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await UserController.addUserPoint(data);

    new AppResponse({
      code: 200,
      message: "USER.ADD_POINT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(userRoutes, "get", ":id/vouchers", authenticate, adminOnly)
  static async getsUserVouchers(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetUserVouchers = { id, ...req.body };
    try {
      data = GetUserVouchersSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await UserController.getUserVouchers(data, {
      withMetadata: true,
    });
    await Promise.all(
      response.items.map(async (i) => {
        if (i.metadata?.imageUri) {
          i.metadata.imageUri = await getFileStorageInstance().getFullUrl(
            i.metadata?.imageUri,
          );
        }

        i.getPublicFields();
        return i;
      }),
    );

    new AppResponse({
      code: 200,
      message: "USER.FETCH_VOUCHERS_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(
    userRoutes,
    "patch",
    ":id/vouchers/:voucherId/use",
    authenticate,
    adminOnly,
  )
  static async useUserVoucher(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    const voucherId = req.params.voucherId;
    let data: TUseUserVoucher = { id, voucherId };
    try {
      data = UseUserVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    await UserController.useUserVoucher(data);

    new AppResponse({
      code: 200,
      message: "USER.REDEEM_VOUCHER_SUCCESS",
    }).asJsonResponse(res);
  }
}
