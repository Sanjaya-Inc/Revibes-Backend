import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { parseFormData } from "../../utils/formatter/formData";
import { VoucherController } from "../../controllers/VoucherController";
import { PaginationSchema, TPagination } from "../../dto/pagination";
import {
  CreateVoucherSchema,
  DeleteVoucherSchema,
  EditVoucherSchema,
  GetVoucherSchema,
  SwitchVoucherStatusSchema,
  TCreateVoucher,
  TDeleteVoucher,
  TEditVoucher,
  TGetVoucher,
  TSwitchVoucherStatus,
} from "../../dto/voucher";
import { getFileStorageInstance } from "../../utils/firebase";

export const voucherRoutes = new Routes("vouchers");

export class VoucherHandlers {
  @registerRoute(voucherRoutes, "get", "", authenticate, adminOnly)
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

    const response = await VoucherController.getVouchers(
      req.user.data,
      pagination,
    );

    await Promise.all(
      response.items.map(async (i) => {
        if (i.imageUri) {
          i.imageUri = await getFileStorageInstance().getFullUrl(i.imageUri);
        }

        i.getPublicFields();
        return i;
      }),
    );

    new AppResponse({
      code: 200,
      message: "VOUCHER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "get", ":id", authenticate, adminOnly)
  static async getVoucher(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TGetVoucher = { id };
    try {
      // Validate form data using Zod
      data = GetVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.getVoucher(req.user, data);
    if (!response) {
      throw new AppError(404, "VOUCHER.NOT_FOUND");
    }

    if (response.data.imageUri) {
      response.data.imageUri = await getFileStorageInstance().getFullUrl(
        response.data.imageUri,
      );
    }

    new AppResponse({
      code: 200,
      message: "VOUCHER.FETCH_SUCCESS",
      data: response.data.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "post", "", authenticate, adminOnly)
  static async createVoucher(req: Request, res: Response) {
    let data = parseFormData<TCreateVoucher>(req);

    try {
      // Validate form data using Zod
      data = CreateVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.createVoucher(data);

    if (response.imageUri) {
      response.imageUri = await getFileStorageInstance().getFullUrl(
        response.imageUri,
      );
    }

    new AppResponse({
      code: 201,
      message: "VOUCHER.CREATE_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "put", ":id", authenticate, adminOnly)
  static async editVoucher(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TEditVoucher = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = EditVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.editVoucher(req.user, data);
    new AppResponse({
      code: 200,
      message: "VOUCHER.UPDATE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteVoucher(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TDeleteVoucher = { id };

    try {
      // Validate form data using Zod
      data = DeleteVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.deleteVoucher(req.user, data);
    new AppResponse({
      code: 200,
      message: "VOUCHER.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "patch", ":id/status", authenticate, adminOnly)
  static async switchVoucherStatus(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const id = req.params.id;
    let data: TSwitchVoucherStatus = { id, ...req.body };

    try {
      // Validate form data using Zod
      data = SwitchVoucherStatusSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.switchVoucherStatus(
      req.user,
      data,
    );
    new AppResponse({
      code: 200,
      message: "VOUCHER.SWITCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
