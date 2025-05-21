import { Request, Response } from "express";
import AppError from "../utils/formatter/AppError";
import UserController from "../controllers/UserController";

export const authenticate = async (
  req: Request,
  res: Response,
  next: () => void,
) => {
  if (
    !req?.headers?.authorization?.startsWith("Bearer ")
  ) {
    throw new AppError(401, "REQ_MISSING_TOKEN");
  }
  try {
    const token = req.headers.authorization.split("Bearer ")[1];
    
    const user = await UserController.getUserByAccessToken(token);
    if (!user?.hasAccess()) {
      throw new AppError(401, "REQ_INVALID_TOKEN");
    }

    

    req.user = user;
    next(); // Proceed to the next handler
  } catch (error) {
    throw new AppError(401, "REQ_INVALID_TOKEN");
  }
};
