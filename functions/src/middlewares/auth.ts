import { Request, Response } from "express";
import AppError from "../utils/formatter/AppError";
import { UserController } from "../controllers/UserController";
import { UserRole } from "../models/User";

export const authenticate = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  if (!req?.headers?.authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "AUTH.MISSING_TOKEN");
  }
  try {
    const token = req.headers.authorization.split("Bearer ")[1];

    const user = await UserController.getUserByAccessToken(token);
    if (!user?.hasAccess()) {
      throw new AppError(401, "AUTH.INVALID_TOKEN");
    }

    req.user = user;
    next(); // Proceed to the next handler
  } catch (error) {
    throw new AppError(401, "AUTH.INVALID_TOKEN");
  }
};

export const adminOnly = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  if (req.user?.role !== UserRole.ADMIN) {
    throw new AppError(403, "COMMON.FORBIDDEN");
  }

  next(); // Proceed to the next handler
};
