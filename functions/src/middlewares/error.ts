import { Request, Response, NextFunction } from "express";
import AppError from "../utils/formatter/AppError";
import AppResponse from "../utils/formatter/AppResponse";

/* eslint-disable @typescript-eslint/no-unused-vars */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("error:", err);
  if (err instanceof AppError) {
    return new AppResponse({ err }).asJsonResponse(res);
  }

  const message = (err as any)?.message || String(err);
  const newErr = new AppError(500, "INTERNAL_SERVER_ERROR", [message]);
  return new AppResponse({ err: newErr }).asJsonResponse(res);
};
/* eslint-enable @typescript-eslint/no-unused-vars */
