import AuthController from "../../controllers/AuthController";
import {
  SignupSchema,
  SignupWithGoogleSchema,
  LoginSchema,
  LoginWithGoogleSchema,
  TSignup,
  TSignupWithGoogle,
  TLogin,
  TLoginWithGoogle,
  RefreshSchema,
  TRefresh,
} from "../../dto/auth";
import { Request, Response } from "express";
import AppError from "../../utils/formatter/AppError";
import AppResponse from "../../utils/formatter/AppResponse";
import Routes from "./route";
import { authenticate } from "../../middlewares/auth";
import { registerRoute } from "../../utils/decorator/registerRoute";

export const authRoutes = new Routes("auth");

export class AuthHandlers {
  @registerRoute(authRoutes, "post", "signup/email")
  static async signup(req: Request, res: Response) {
    let data: TSignup = req.body;

    try {
      data = SignupSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await AuthController.signup(data);
    new AppResponse({
      code: 201,
      message: "AUTH.SIGNUP_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "post", "signup/google")
  static async signupWithGoogle(req: Request, res: Response) {
    let data: TSignupWithGoogle = req.body;

    try {
      data = SignupWithGoogleSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await AuthController.signupWithGoogle(data);
    new AppResponse({
      code: 201,
      message: "AUTH.SIGNUP_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "post", "login/email")
  static async login(req: Request, res: Response) {
    let data: TLogin = req.body;

    try {
      data = LoginSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await AuthController.login(data);
    new AppResponse({
      code: 200,
      message: "AUTH.LOGIN_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "post", "login/google")
  static async loginWithGoogle(req: Request, res: Response) {
    let data: TLoginWithGoogle = req.body;

    try {
      data = LoginWithGoogleSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await AuthController.loginWithGoogle(data);
    new AppResponse({
      code: 200,
      message: "AUTH.LOGIN_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "post", "logout", authenticate)
  static async logout(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    await AuthController.logout(req.user.data);
    new AppResponse({
      code: 200,
      message: "AUTH.LOGOUT_SUCCESS",
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "post", "refresh")
  static async refresh(req: Request, res: Response) {
    let data: TRefresh = req.body;

    try {
      data = RefreshSchema.parse(data);
    } catch (err: any) {
      throw new AppError(400, "COMMON.BAD_REQUEST").errFromZode(err);
    }

    const response = await AuthController.refresh(data);
    new AppResponse({
      code: 201,
      message: "AUTH.REFRESH_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }

  @registerRoute(authRoutes, "get", "verify-token", authenticate)
  static async getVerifyToken(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError(403, "COMMON.FORBIDDEN");
    }

    const response = await AuthController.getVerifyToken(req.user.data);
    new AppResponse({
      code: 200,
      message: "AUTH.GET_VERIFY_TOKEN_SUCCESS",
      data: response,
    }).asJsonResponse(res);
  }
}
