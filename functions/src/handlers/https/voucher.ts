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
  TCreateVoucher,
  TDeleteVoucher,
} from "../../dto/voucher";

export const voucherRoutes = new Routes("vouchers");

export class VoucherHandlers {
  @registerRoute(voucherRoutes, "get", "", authenticate)
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
    new AppResponse({
      code: 200,
      message: "VOUCHER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "post", "", authenticate, adminOnly)
  static async createVoucher(req: Request, res: Response) {
    const data = parseFormData<TCreateVoucher>(req);

    try {
      // Validate form data using Zod
      CreateVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.createVoucher(data);
    new AppResponse({
      code: 201,
      message: "VOUCHER.CREATE_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(voucherRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteVoucher(req: Request, res: Response) {
    const id = req.params.id;
    let data: TDeleteVoucher = { id };

    try {
      // Validate form data using Zod
      data = DeleteVoucherSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await VoucherController.deleteVoucher(data);
    new AppResponse({
      code: 200,
      message: "VOUCHER.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
