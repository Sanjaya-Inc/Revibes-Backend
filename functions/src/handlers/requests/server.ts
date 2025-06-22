import express, { NextFunction, Request, Response } from "express";
import { authRoutes } from "./auth";
import { bannerRoutes } from "./banner";
import { countryRoutes } from "./country";
import { userRoutes } from "./user";
import { storeRoutes } from "./store";

import { errorHandler } from "../../middlewares/error";
import { bodyParser } from "../../middlewares/parser";
import { UserController } from "../../controllers/UserController";

const ROUTES = [
  ...authRoutes.getApis(),
  ...bannerRoutes.getApis(),
  ...countryRoutes.getApis(),
  ...userRoutes.getApis(),
  ...storeRoutes.getApis(),
];

export const app = express();

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

app.use(bodyParser);

// Install api routes
for (const [method, path, ...handlers] of ROUTES) {
  app[method](path, ...handlers.map((h) => asyncHandler(h)));
}

app.use(errorHandler);

UserController.initAdminRoot();

export default app;
