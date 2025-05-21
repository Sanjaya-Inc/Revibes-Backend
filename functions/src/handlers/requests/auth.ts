import Auth from "../../controllers/AuthController";
import { SignupSchema, SignupWithGoogleSchema, LoginSchema, LoginWithGoogleSchema, TSignup, TSignupWithGoogle, TLogin, TLoginWithGoogle, RefreshSchema, TRefresh, TTokenPairRes, TSignupRes } from "../../dto/auth";
import {Request, Response} from "express";
import AppError from "../../utils/formatter/AppError";
import AppResponse from "../../utils/formatter/AppResponse";

export const signup = async(req: Request, res: Response) => {
  const data: TSignup = req.body;

  try {
    SignupSchema.parse(data);
  } catch(err: any) {
    throw new AppError(400, "BAD_REQUEST").errFromZode(err);
  }

  const response = await Auth.signup(data);
  new AppResponse<TSignupRes>({code: 201, message: "AUTH_SIGNUP_SUCCESS", data: response}).asJsonResponse(res);
};

export const signupWithGoogle = async(req: Request, res: Response) => {
  const data: TSignupWithGoogle = req.body;

  try {
    SignupWithGoogleSchema.parse(data);
  } catch(err: any) {
    throw new AppError(400, "BAD_REQUEST").errFromZode(err);
  }

  const response = await Auth.signupWithGoogle(data);
  new AppResponse<TTokenPairRes>({code: 201, message: "AUTH_SIGNUP_SUCCESS", data: response}).asJsonResponse(res);
};

export const login = async(req: Request, res: Response) => {
  const data: TLogin = req.body;

  try {
    LoginSchema.parse(data);
  } catch(err: any) {
    throw new AppError(400, "BAD_REQUEST").errFromZode(err);
  }

  const response = await Auth.login(data);
  new AppResponse<TTokenPairRes>({code: 200, message: "AUTH_LOGIN_SUCCESS", data: response}).asJsonResponse(res);
};

export const loginWithGoogle = async(req: Request, res: Response) => {
  const data: TLoginWithGoogle = req.body;

  try {
    LoginWithGoogleSchema.parse(data);
  } catch(err: any) {
    throw new AppError(400, "BAD_REQUEST").errFromZode(err);
  }

  const response = await Auth.loginWithGoogle(data);
  new AppResponse<TTokenPairRes>({code: 200, message: "AUTH_LOGIN_SUCCESS", data: response}).asJsonResponse(res);
};

export const logout = async(req: Request, res: Response) => {
  await Auth.logout(req.user!);
  new AppResponse({code: 200, message: "AUTH_LOGOUT_SUCCESS"}).asJsonResponse(res);
};

export const refresh = async(req: Request, res: Response) => {
  const data: TRefresh = req.body;

  try {
    RefreshSchema.parse(data);
  } catch(err: any) {
    throw new AppError(400, "BAD_REQUEST").errFromZode(err);
  }

  const response = await Auth.refresh(data);
  new AppResponse<TTokenPairRes>({code: 200, message: "AUTH_REFRESH_SUCCESS", data: response}).asJsonResponse(res);
};