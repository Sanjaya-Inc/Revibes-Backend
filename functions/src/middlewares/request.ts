import {Request, Response} from "express";
import AppResponse from "../utils/formatter/AppResponse";

export type method = "GET" | "POST" | "PUT" | "DELETE";

export const allowedMethod = (...allowedMethods: method[]) => {
  return (req: Request, res: Response, next: () => void) => {
    if (!allowedMethods.includes(req.method as method)) {
      const err = new AppError("REQ_METHOD_NOT_ALLOWED");
      new AppResponse({code: 405, err}).asJsonResponse(res);
      return;
    }
    next(); // Call the next middleware or handler
  };
};
