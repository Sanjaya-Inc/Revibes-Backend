import { Request, Response } from "express";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { registerRoute } from "../../utils/decorator/registerRoute";
import { authenticate } from "../../middlewares/auth";
import AppError from "../../utils/formatter/AppError";
import { UserController } from "../../controllers/UserController";
import User from "../../models/User";

export const userRoutes = new Routes("users");

export class UserHandlers {
  @registerRoute(userRoutes, "get", "me", authenticate)
  static async getUser(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await UserController.getSelfProfile(req.user);
    new AppResponse<User>({
      code: 200,
      message: "USER.FETCH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
