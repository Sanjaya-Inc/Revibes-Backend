import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { adminOnly, authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { StoreBranchController } from "../../controllers/StoreBranchController";
import {
  AddStoreBranchSchema,
  DeleteStoreBranchSchema,
  TAddStoreBranch,
  TDeleteStoreBranch,
  TEditStoreBranch,
} from "../../dto/storeBranch";

export const storeRoutes = new Routes("stores");

export class StoreHandlers {
  @registerRoute(storeRoutes, "get", "", authenticate)
  static async getStoreBranchs(req: Request, res: Response) {
    const response = await StoreBranchController.getStoreBranches();
    new AppResponse({
      code: 200,
      message: "STORE.FETCH_SUCCESS",
      data: response.map((r) => r.pickFields()),
    }).asJsonResponse(res);
  }

  @registerRoute(storeRoutes, "post", "", authenticate, adminOnly)
  static async addStoreBranch(req: Request, res: Response) {
    const data: TAddStoreBranch = req.body;

    try {
      AddStoreBranchSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await StoreBranchController.addStoreBranch(data);
    new AppResponse({
      code: 201,
      message: "STORE.ADD_SUCCESS",
      data: response.pickFields(),
    }).asJsonResponse(res);
  }

  @registerRoute(storeRoutes, "put", ":id", authenticate, adminOnly)
  static async editStoreBranch(req: Request, res: Response) {
    const id = req.params.id;
    const data: TEditStoreBranch = { id, ...req.body };

    try {
      AddStoreBranchSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await StoreBranchController.editStoreBranch(data);
    new AppResponse({
      code: 200,
      message: "STORE.EDIT_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(storeRoutes, "delete", ":id", authenticate, adminOnly)
  static async deleteStoreBranch(req: Request, res: Response) {
    const id = req.params.id;
    const data: TDeleteStoreBranch = { id };

    try {
      // Validate form data using Zod
      DeleteStoreBranchSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await StoreBranchController.deleteStoreBranch(data);
    new AppResponse({
      code: 200,
      message: "STORE.DELETE_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
